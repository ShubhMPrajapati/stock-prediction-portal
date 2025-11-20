import { Button } from "./Button"
import { Link, useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../AuthProvider"   

export const Header = () => {
  const { isLoggedIn, setIsloggedIn } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setIsloggedIn(false)
    navigate('/login')
  }

  return (
    <div className='navbar container pt-3 pb-3 align-items-start'>
      <Link className="navbar-brand text-light" to="/">Stock Prediction Portal</Link>
      <div>
        {isLoggedIn ? (
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Button class='btn-outline-info' text='Login' url="/login" />
            &nbsp;
            <Button class='btn btn-info' text='Register' url="/register" />
          </>
        )}
      </div>
    </div>
  )
}
