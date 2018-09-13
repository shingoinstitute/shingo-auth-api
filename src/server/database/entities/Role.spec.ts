import { Role } from './Role'
import { validate } from 'class-validator'

describe('Role', () => {
  describe('validation', () => {
    describe('create group', () => {
      const groups = ['create']

      it('does not validate if id is supplied', async () => {
        expect.assertions(2)
        const role = new Role()
        role.id = 1
        role.name = 'some name'
        role.service = 'some service'
        const errors = await validate(role, { groups })
        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('id')
      })

      it('validates with valid input', async () => {
        expect.assertions(1)
        const role = new Role()
        role.name = 'some name'
        role.service = 'some service'
        const errors = await validate(role, { groups })
        expect(errors).toHaveLength(0)
      })

      it('does not validate when missing required properties', async () => {
        expect.assertions(3)
        const name = 'some name'
        const service = 'some service'
        const nameMask = 0b01
        const serviceMask = 0b10

        for (let i = 0; i < 3; i++) {
          const role = new Role()
          // tslint:disable:no-bitwise
          if ((i & nameMask) !== 0) role.name = name
          if ((i & serviceMask) !== 0) role.service = service
          // tslint:enable:no-bitwise
          const errors = await validate(role, { groups })
          expect(errors).not.toHaveLength(0)
        }
      })
    })

    describe('update group', () => {
      const groups = ['update']

      it('requires only id', async () => {
        expect.assertions(2)
        const missingId = new Role()
        const errors = await validate(missingId, { groups })
        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('id')
      })
    })
  })
})
