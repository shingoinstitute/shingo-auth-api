import { User } from './User'
import { validate } from 'class-validator'

describe('User', () => {
  describe('validation', () => {
    describe('create group', () => {
      const groups = ['create']
      it('does not validate if id is supplied', async () => {
        expect.assertions(2)

        const user = new User()
        user.id = 1
        user.email = 'someemail@gmail.com'
        user.password = 'somepassword'
        user.services = 'someservice'
        user.extId = 'some external id'

        const errors = await validate(user, { groups })

        expect(errors).toHaveLength(1)
        expect(errors[0].property).toEqual('id')
      })

      it('validates with valid input', async () => {
        expect.assertions(1)
        const user = new User()
        user.email = 'someemail@gmail.com'
        user.password = 'somepassword'
        user.services = 'someservice'
        user.extId = 'some external id'
        const errors = await validate(user, { groups })

        expect(errors).toHaveLength(0)
      })

      it('does not validate when missing required properties', async () => {
        expect.assertions(15)
        const email = 'someemail@gmail.com'
        const password = 'somepassword'
        const services = 'someservice'
        const extId = 'some external id'
        const emailMask = 0b0001
        const pwMask = 0b0010
        const serviceMask = 0b0100
        const extIdMask = 0b1000

        // when i = 15, all required fields are filled, so we have no errors
        // don't need to check that case
        for (let i = 0; i < 15; i++) {
          const user = new User()
          // tslint:disable:no-bitwise
          if ((i & emailMask) !== 0) user.email = email
          if ((i & pwMask) !== 0) user.password = password
          if ((i & serviceMask) !== 0) user.services = services
          if ((i & extIdMask) !== 0) user.extId = extId
          // tslint:enable:no-bitwise
          const errors = await validate(user, { groups })

          expect(errors).not.toHaveLength(0)
        }
      })
    })

    describe('update group', () => {
      const groups = ['update']
      it('validates with correct input', async () => {
        const user = new User()
        user.id = 1
        user.email = 'someemail@gmail.com'

        const errors = await validate(user, { groups })
        expect(errors).toHaveLength(0)
      })

      it('requires only either id or extId', async () => {
        expect.assertions(3)
        const missingId = new User()
        missingId.extId = 'some external id'

        const missingExtId = new User()
        missingExtId.id = 1

        const missingBoth = new User()

        const bothErr = await validate(missingBoth, { groups })
        const extErr = await validate(missingExtId, { groups })
        const idErr = await validate(missingId, { groups })
        expect(idErr).toHaveLength(0)
        expect(extErr).toHaveLength(0)
        expect(bothErr).toHaveLength(2)
      })
    })
  })
})
