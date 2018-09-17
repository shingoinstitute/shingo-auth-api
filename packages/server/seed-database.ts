#! /usr/bin/env ts-node
import { mysqlConnection, Role, User } from './src/database/mysql.service'
import { RoleService, UserService } from './src'
import { readFile } from 'fs'
import { promisify } from 'util'

// tslint:disable:no-console

const rf = promisify(readFile)

interface UserSeed {
  email: string
  password: string
  extId: string
  manager?: boolean
}

interface Args {
  file?: string
  drop: boolean
}

const helpStr = `USAGE: seed-database.ts [Options] [FILE]
Seeds the auth database using a file (specified by FILE) containing
a JSON object matching the FileData type from the following schema:
type UserSeed = { email: string, password: string, extId: string, manager?: boolean }
type FileData = UserSeed | UserSeed[]

Positional Arguments:
    FILE    An optional file name. If FILE is not provided or FILE is '-', data is read from stdin

Options:
    --drop  Drop the database before seeding
    --help  Show this help
`

const parseArgs = (): Args => {
  const [, , ...args] = process.argv
  if (args.length > 3) {
    console.log(helpStr)
    process.exit(1)
  }

  const help = !!args.find(v => v === '--help')

  if (help) {
    console.log(helpStr)
    process.exit(0)
  }

  const drop = !!args.find(v => v === '--drop')
  const rest = args.filter(v => v !== '--drop')

  if (rest.length > 1) {
    console.log(helpStr)
    process.exit(1)
  }

  return { file: rest[0], drop }
}

const readStdin = () => {
  const stdin = process.stdin
  let data = ''
  if (stdin.isTTY) {
    console.log(`Enter JSON string of single object or array of objects with the following type:
{ email: string, password: string, extId: string, manager?: boolean }
End input with ctrl-d`)
  }

  return new Promise<string>(res => {
    stdin.setEncoding('utf8')
    stdin.on('readable', () => {
      let chunk
      // tslint:disable-next-line:no-conditional-assignment
      while (null !== (chunk = stdin.read())) {
        data += chunk
      }
    })
    stdin.on('end', () => {
      res(data)
    })
  })
}

const verifyUser = (u: any): u is UserSeed =>
  u.email &&
  typeof u.email === 'string' &&
  u.password &&
  typeof u.password === 'string' &&
  u.extId &&
  typeof u.extId === 'string'

const parseUser = (p: Promise<string>) =>
  p
    .then(data => JSON.parse(data))
    .then(d => (Array.isArray(d) ? d : [d]))
    .then(d => {
      const valid = d.every(verifyUser)
      if (!valid) {
        throw new Error(`invalid data: ${JSON.stringify(d)}`)
      }
      return d as UserSeed[]
    })
    .catch(e => {
      console.error(e)
      return [] as UserSeed[]
    })

// tslint:disable-next-line:no-shadowed-variable
const getUsers = (file: string | undefined) =>
  parseUser(
    file === '-' || !file ? readStdin() : rf(file, { encoding: 'utf8' }),
  )

const service = 'affiliate-portal'
const roles = ['Facilitator', 'Affiliate Manager']

const seed = async ({ file, drop }: Args) => {
  const users = await getUsers(file)
  const conn = await mysqlConnection(process.env as any)

  await conn.synchronize(drop)

  const roleService = new RoleService(conn.getRepository(Role))
  const userService = new UserService(conn.getRepository(User))

  const aff = Promise.all(
    roles.map(r => roleService.create({ name: r, service } as any)),
  ).then(rs => rs.find(r => r.name === 'Affiliate Manager'))

  const newUsersP = Promise.all(
    users
      .map(u => ({ ...u, services: service }))
      .map(u => userService.create(u as User)),
  )

  // rather than awaiting our promises immediately, we let node determine
  // which to execute first, and just await right where we need the resolved values
  // not really useful for a small data set, but for hundreds of users it might be nice
  return Promise.all(
    (await newUsersP)
      .filter(u => !!users.find(us => us.email === u.email)!.manager)
      .map(async u =>
        userService.addRole({ userEmail: u.email, roleId: (await aff)!.id }),
      ),
  )
}

seed(parseArgs()).then(() => process.exit())
