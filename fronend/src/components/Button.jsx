import { Link } from "react-router-dom"

export const Button = (props) => {
    return (
        <>
            <Link className={`btn ${props.class}`} to={props.url}>{props.text}</Link>
        </>
    )
}
