#! /usr/bin/env ts-node
import { MySQLService, Role, User } from './src/database/mysql.service'
import { RoleService, UserService } from './src/shared'
import { readFile } from 'fs'
import { promisify } from 'util'

const rf = promisify(readFile)

interface UserSeed {
  email: string
  password: string
  extId: string
  manager?: boolean
}

const readStdin = () => {
  const stdin = process.stdin;
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
      while (null !== (chunk = stdin.read())) {
        data += chunk
      }
    })
    stdin.on('end', () => {
      res(data);
    })
  })
}

const verifyUser = (u: any): u is UserSeed =>
  u.email && typeof u.email === 'string' &&
  u.password && typeof u.password === 'string' &&
  u.extId && typeof u.extId === 'string'

const parseUser = (p: Promise<string>) =>
  p.then(data => JSON.parse(data))
   .then(d => Array.isArray(d) ? d : [d])
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


const getUsers = (file: string | undefined) =>
  parseUser(file === '-' || file === '' || !file
    ? readStdin()
    : rf(file, { encoding: 'utf8' }))

const file = process.argv[2]

const service = 'affiliate-portal'
const roles = ['Facilitator', 'Affiliate Manager']

const seed = async () => {
  const users = await getUsers(file)
  await MySQLService.init();
  await MySQLService.connection.syncSchema(true)

  const aff = Promise.all(
    roles.map(r => RoleService.create({ name: r, service } as Role))
  ).then(rs => rs.find(r => r.name === 'Affiliate Manager'))

  const newUsersP =
    users
      .map(u => ({ ...u, services: service }))
      .map(u => UserService.create(u as User))

  // rather than awaiting our promises immediately, we let node determine
  // which to execute first, and just await right where we need the resolved values
  // not really useful for a small data set, but for hundreds of users it might be nice
  return Promise.all(
    (await Promise.all(newUsersP))
    .filter(u => !!users.find(us => us.email === u.email).manager)
    .map(async u => UserService.addRole({ userEmail: u.email, roleId: (await aff).id }))
  )
}

seed().then(() => process.exit())