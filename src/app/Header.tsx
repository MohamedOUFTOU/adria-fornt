import React,{Fragment} from 'react';
import {Nav, Navbar} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {GlobalState} from "./types";
import {logOut} from '../auth/AuthAction'

const iconPath = process.env.PUBLIC_URL + '/logo192.png';
const Header = (props: any) => {
    const {token} = useSelector(
        (state: GlobalState) => state.auth
    );
    const dispatch = useDispatch();
    const history = useHistory();
    let navs = null;
    navs =
        <Fragment>
            <Nav.Link
                onClick={() => {
                    history.push('/ajouter-virement')
                }}>
                Ajouter Virement
            </Nav.Link>

            <Nav.Link
                onClick={() => {
                    history.push('/verification')
                }}>
                Signer Virement
            </Nav.Link>

            <Nav.Link onClick={() => {
                history.push('/list-virements')
            }}>
                List Virements
            </Nav.Link>

        </Fragment>
    
    if (token) {
        // navs = <Fragment><Nav.Link
        //     onClick={() => {
        //         history.push('/ajouter-virement')
        //     }}>Ajouter Virement</Nav.Link> <Nav.Link onClick={() => {
        //     history.push('/list-virements')
        
        // }}>List Virements</Nav.Link></Fragment>
    }
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href=""><img width="100px" src={iconPath} alt="Logo"/></Navbar.Brand>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto" activeKey={history.location.pathname}>
                    {navs}
                </Nav>
                <Nav>
                    <Nav.Link onClick={() => {
                        if (token) {
                            dispatch(logOut())
                        }
                        history.push('/auth')
                    }}>{token ? 'Logout' : 'Login'}</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;
