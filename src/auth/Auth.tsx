import React, {useState} from "react";
import {Alert, Button, Col, Form, Modal, Row, Spinner} from "react-bootstrap";
import {useForm} from "react-hook-form";
import * as actions from './AuthAction'
import {useDispatch, useSelector} from 'react-redux'
import {GlobalState, IAuthData} from "../app/types";
import {Redirect} from 'react-router-dom'
import {Capture, CaptureProps} from "../shared/Capture";

const captureProps: CaptureProps = {
    onSuccess: null, onError: null, backEndUrl: null
}


const Auth = (props: any) => {
    const {register, errors, handleSubmit} = useForm<IAuthData>();

    const {loading, error, token} = useSelector(
        (state: GlobalState) => state.auth
    );
    const [show, setShow] = useState(false);

    const dispatch = useDispatch();

    const onSubmit = (data: IAuthData) => {
        dispatch(actions.auth(data));
    };

    return (
        <div>
            <Row className="justify-content-md-center mt-4">
                {/*{token ? <Redirect to="/list-virements"/> : null}*/}

                <Col xl={6} md={8} sm={10}>
                    <h2 className="mb-4">Login</h2>
                    {
                        error ? <Alert className='mt-2' variant="danger">{error}</Alert> : null
                    }
                    {
                        token ? <Alert className='mt-2' variant="success">{token}</Alert> : null
                    }
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="text"
                                          name="username"
                                          placeholder="Enter username"
                                          ref={register({required: true})}/>
                            {
                                (errors.username?.type === 'required') ?
                                    <Alert className='mt-2' variant="danger">{"First name is required"}</Alert> : null
                            }
                        </Form.Group>
                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control name="password"
                                          type="password"
                                          placeholder="Password"
                                          ref={register({required: true})}/>
                            {
                                (errors.password?.type === 'required') ?
                                    <Alert className='mt-2' variant="danger">{"Password is required"}</Alert> : null
                            }
                        </Form.Group>
                        <Row>
                            <Col className='col-3'>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {
                                        loading ? <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        /> : null
                                    }
                                    {loading ? ' Loading...' : 'Submit'}
                                </Button>
                            </Col>
                            <Col className='col-3 ml-auto'>
                                <Button variant="success" disabled={show} onClick={() => setShow(true)}>
                                    {
                                        show ? <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        /> : null
                                    }
                                    {show ? ' Loading...' : 'Use FaceID'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Modal
                size="lg"
                show={show}
                onHide={() => setShow(false)}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        Use FaceID
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Capture {...captureProps} />
                </Modal.Body>
            </Modal>
        </div>
    )

}
export default Auth;
// const mapStateToProps = (state: GlobalState) => {
//     return {
//         loading: state.auth.loading
//     }
//
// }
// const mapDispatchToProps = (dispatch: any) => {
//     return {
//         onAuth: (data: IAuthData) => dispatch(actions.auth(data)),
//     }
// }
// export default connect(mapStateToProps, mapDispatchToProps)(Auth);
