import { Button } from "./Button"

export const Header = () => {
  return (
    <div className='navbar container    pt-3 pb-3 align-items-start'>
        <a className="navbar-brand text-light" href="">Stock Prediction Portal</a>
        <div>
            <Button class='btn-outline-info' text='Login'/>
            &nbsp;
             
             <Button class ='btn btn-info'  text='Register'/>
        </div>
    </div>
  )
}
