import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/User.context'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'

const UserAuth = ({children}) => {
    const { user } = useContext(UserContext)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { setUser } = useContext(UserContext)

    useEffect(() => {
      let mounted = true

      const verify = async () => {
        try {
          const res = await axios.get('/auth/profile')
          if (!mounted) return
          if (res?.data?.user) {
            setUser(res.data.user)
            setLoading(false)
            return
          }
        } catch (err) {
            console.log(err)
        }

        if (mounted) navigate('/login')
      }

      verify()

      return () => { mounted = false }
    }, [setUser, navigate])

    if (loading) {
        return (
            <div className='flex h-screen w-screen items-center justify-center'>
                <div className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'></div>
            </div>
        )
    }

  return (
    <>
      {children}
    </>
  )
}

export default UserAuth
