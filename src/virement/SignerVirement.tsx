import React, { Fragment, useState } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { Alert, Button, Col, Form, ListGroup, Modal, Row, Spinner, InputGroup, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import http from "../app/Client";
import { useSelector } from "react-redux";
import { GlobalState } from "../app/types";
import { AlertI, Capture, CaptureProps } from "../shared/Capture";
import { AxiosResponse } from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCreditCard, faEye, faTrashAlt, faEdit } from '@fortawesome/free-regular-svg-icons';
import { faDollarSign, faAdjust, faPencilAlt, faKey } from '@fortawesome/free-solid-svg-icons';

type Overview = {
    id: number,
    accountNumber: string,
    createdDate: string,
    executedDate: string,
    montant: number,
    motif: string,
    nbrOfBenf: number,
    selectedBeneficiaire: {
        id: number,
        montant: string,
        nom: string,
        prenom: string
    }[]
}

interface ISignForm {
    virmentID: number,
    id: number,
    password: string,
    passwordMode: boolean
}

export const SignSuccess = () => {
    return <Row>
        <Col className="col-6 mx-auto">
            <Alert className='mt-2' variant="success">Votre demande a été signé !</Alert>
        </Col>
    </Row>
}


const SignerVirement = () => {

    const [show, setShow] = useState(false);
    const { userId, token } = useSelector(
        (state: GlobalState) => state.auth
    );

    const location = useLocation();
    const history = useHistory();
    // @ts-ignore
    let state: Overview = { ...location.state?.detail };
    const { register, errors, handleSubmit } = useForm<any>();
    const [error, editError] = useState('');

    let form: ISignForm = {
        virmentID: state.id,
        id: userId ? userId : -1,
        password: '',
        passwordMode: false
    }
    const postData = (form: ISignForm) => http.post('sign', form, { headers: { 'Authorization': token } })
        .then(response => {
            if (response.data === true) {
                history.push('/success')
            }
        }).catch(errors => {
            editError(errors.response.data.message);
            console.log(errors.response.data.message)
        });

    const onSubmit = (data: any) => {
        postData({ ...form, password: data?.password })
    };
    const captureProps: CaptureProps = {
        backEndUrl: null, onError: null,
        onSuccess: (response: AxiosResponse, setAlert: Function) => {
            console.log(response)
            if (response.data.response) {
                postData({ ...form, passwordMode: false })
            } else if (!response.data.error && !response.data.response) {
                setAlert((alert: AlertI) => ({
                    variant: "danger",
                    message: "The image provided by the webcam did not match any user in the database",
                    link: response.data?.image_requested_link,
                    loading: false
                }))
            }
        }
    }
    return (
        
        
            

            

        <Fragment>

                    {/*{token ? null : <Redirect to="/auth"/>}*/}

                    <Row>
                        <Col className="col-6 mx-auto mt-5">
                            {error !== '' ? <Alert className='mt-2' variant="danger">{error}</Alert> : null}
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col className="col-6 mx-auto">
                            <h5 className="title text-center mt-4 mb-4"> <FontAwesomeIcon icon={faPencilAlt} /> &nbsp;Détails du virement</h5>
                            <ListGroup>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faCreditCard} />&nbsp;
                    Numero de compte : {state.accountNumber}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faCalendarAlt} />&nbsp;
                    Date de création : {state.createdDate}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faAdjust} />&nbsp;
                Motif : {state.motif}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faAdjust} />&nbsp;
                Nombre des bénéficiaires : {state.nbrOfBenf}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faAdjust} />&nbsp;
                List des bénéficiaires :
                    <ListGroup variant="flush" className="mt-3">
                                        {
                                            state.selectedBeneficiaire?.map(beneficiaire => {
                                                return (
                                                    <ListGroup.Item variant="secondary" key={beneficiaire.id}>
                                                        {`${beneficiaire.nom.toUpperCase()} ${beneficiaire.prenom.toUpperCase()} : ${beneficiaire.montant} DH`}
                                                    </ListGroup.Item>)
                                            })
                                        }
                                    </ListGroup>
                                </ListGroup.Item>
                                <ListGroup.Item className="list-group-item-secondary">Montant total : {state.montant} DH</ListGroup.Item>
                            </ListGroup>
                        </Col>

                    </Row>

                    <Form onSubmit={handleSubmit(onSubmit)}>

                        <Row className="col-6 mx-auto mt-4">
                            <Col className="col-6">

                                <Col>
                                    <Form.Group controlId="passwordcontrolId">
                                        <InputGroup>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                    <FontAwesomeIcon icon={faKey} />
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control type="password"
                                                name="password"
                                                placeholder="Password"
                                                ref={register({ required: true })}
                                            />
                                        </InputGroup>

                                    </Form.Group>
                                    {
                                        (errors.password?.type === 'required') ?
                                            <Alert className='mt-2' variant="danger">Vous devez entrer votre mot de
                                        passe</Alert> : null
                                    }
                                </Col>

                            </Col>
                            <Row>
                                <Col className='col-4'>
                                    <Button type="primary" variant="warning">Signer</Button>
                                </Col>
                                <Col className='col-8'>
                                    <Button variant="warning" disabled={show} onClick={() => setShow(true)}>
                                        {
                                            show ? <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            /> : null
                                        }
                                        {show ? ' Loading...' : 'Sign with FaceID'}
                                    </Button>
                                </Col>
                            </Row>
                        </Row>
                    </Form>

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
                </Fragment>
    )
}

export default SignerVirement;
