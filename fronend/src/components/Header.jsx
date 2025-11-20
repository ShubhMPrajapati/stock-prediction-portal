import { Button } from "./Button"
import { Link } from "react-router-dom"

export const Header = () => {
  return (
    <div className='navbar container    pt-3 pb-3 align-items-start'>
        <Link className="navbar-brand text-light" to="/" >Stock Prediction Portal</Link>
        <div>
            <Button class='btn-outline-info' text='Login' url="/login"/>
            &nbsp;
             
             <Button class ='btn btn-info'  text='Register' url="/register"/>
        </div>
    </div>
  )
}
