import { Permission } from './Permission'
import { validate } from 'class-validator'

describe('Permission', () => {
  describe('validation', () => {
    describe('create group', () => {
      const groups = ['create']

      it('does not validate if id is supplied', async () => {
        expect.assertions(2)
        const permission = new Permission()
        permission.id = 1
        permission.resource = 'some resource'
        permission.level = 2
        const errors = await validate(permission, { groups })
        expect(errors).toHaveLength(1)
        expect(errors[0].property).toBe('id')
      })

      it('validates with valid input', async () => {
        expect.assertions(1)
        const permission = new Permission()
        permission.resource = 'some resource'
        permission.level = 2
        const errors = await validate(permission, { groups })
        expect(errors).toHaveLength(0)
      })

      it('does not validate when missing required properties', async () => {
        expect.assertions(3)
        const resource = 'some resource'
        const level = 2
        const resourceMask = 0b01
        const levelMask = 0b10
        for (let i = 0; i < 3; i++) {
          const permission = new Permission()
          // tslint:disable:no-bitwise
          if ((i & resourceMask) !== 0) permission.resource = resource
          if ((i & levelMask) !== 0) permission.level = level
          // tslint:enable:no-bitwise
          const errors = await validate(permission, { groups })
          expect(errors).not.toHaveLength(0)
        }
      })
    })

    describe('update group', () => {
      const groups = ['update']

      it('requires only id', async () => {
        expect.assertions(3)
        const missingId = new Permission()
        const withId = new Permission()
        withId.id = 1
        const missingErrors = await validate(missingId, { groups })
        expect(missingErrors).toHaveLength(1)
        expect(missingErrors[0].property).toBe('id')
        const noErrors = await validate(withId, { groups })
        expect(noErrors).toHaveLength(0)
      })
    })

    describe('delete group', () => {
      const groups = ['delete']

      it('requires either id or both resource and level', async () => {
        expect.assertions(7)
        const missingId = new Permission()
        const withId = new Permission()
        const missingResource = new Permission()
        const missingLevel = new Permission()
        const missingAll = new Permission()

        missingId.resource = 'some resource'
        missingId.level = 1

        withId.id = 1

        missingResource.level = 1

        missingLevel.resource = 'some resource'

        const missingIdErrors = await validate(missingId, { groups })
        const withIdErrors = await validate(withId, { groups })
        const missingResourceErrors = await validate(missingResource, {
          groups,
        })
        const missingLevelErrors = await validate(missingLevel, { groups })
        const missingAllErrors = await validate(missingAll, { groups })
        expect(missingIdErrors).toHaveLength(0)
        expect(withIdErrors).toHaveLength(0)
        expect(missingResourceErrors).toHaveLength(1)
        expect(missingResourceErrors[0].property).toBe('resource')
        expect(missingLevelErrors).toHaveLength(1)
        expect(missingLevelErrors[0].property).toBe('level')
        expect(missingAllErrors).not.toHaveLength(0)
      })
    })
  })
})
