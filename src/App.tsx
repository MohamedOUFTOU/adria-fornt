import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {Provider} from "react-redux";
import {combineReducers, createStore} from "redux";
import {BrowserRouter} from "react-router-dom";
import {Redirect, Route, Switch} from "react-router";
import Auth from "./auth/Auth";
import {Container} from "react-bootstrap";
import Header from "./header/Header";

const store = createStore(combineReducers({}))

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Header/>
                <Container>
                    <Switch>
                        <Route path='/auth' component={Auth}/>
                        <Route path='/ajouter-virement-multiple' render={() => <p>ajouter-virement-multiple</p>}/>
                        <Route path='/verification' render={() => <p>verification</p>}/>
                        <Route path='/results' render={() => <p>results</p>}/>
                        <Route path='/list-virements' render={() => <p>list-virements</p>}/>
                        <Redirect to='/auth'/>
                    </Switch>
                </Container>
            </BrowserRouter>

        </Provider>
    );
}

export default App;
