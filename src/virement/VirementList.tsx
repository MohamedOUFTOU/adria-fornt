/* eslint-disable react-hooks/rules-of-hooks */
import React, { Fragment, useEffect, useState } from 'react';


import { Alert, Button, Col, Form, Row, Table, Container, InputGroup } from 'react-bootstrap';
import http from '../app/Client';
import { Redirect, useHistory } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { GlobalState } from "../app/types";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCreditCard, faEye, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faDollarSign, faAdjust, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

type Compte = {
    id: number,
    numeroCompte: string,
    intitule: string,
    soldeComptable: number
    _links: {
        self: {
            href: string
        }
    }
}
type Abonne = {
    username: string,
    nom: string,
    prenom: string
}

type Virement = {
    id: number,
    dateCreation: string,
    motif: string,
    montant: number,
    dateExcecution: string,
    statut: string,
    abonne: Abonne,
    compte: Compte,
    _links: {
        self: {
            href: string
        }
    }
}


const VirementList = () => {

    const comptes: Compte[] = [];
    const virements: Virement[] = [
        {
            id: 15573,
            dateCreation: "2021-01-14",
            motif: "MTFF",
            montant: 11000.00,
            dateExcecution: "2021-01-14",
            statut: "Enregistré",
            abonne: {
                username: "OULAHYANE",
                nom: "OULAHYANE",
                prenom: "Kaoutar"
            },
            compte: {
                id: 1,
                numeroCompte: "16729",
                intitule: "C1",
                soldeComptable: 1803.02,
                _links: {
                    self: {
                        href: "string"
                    }
                }
            },
            _links: {
                self: {
                    href: "string"
                }
            }
        }
    ];
    const history = useHistory();


    const [state, setState] = useState({
        comptes: comptes,
        virements: virements
    })
    const { userId, token } = useSelector(
        (state: GlobalState) => state.auth
    );

    const deleteVirement = (v: Virement) => {
        const answer = window.confirm(`Want to delete "${v.motif}" with ${v.montant.toFixed(2)} DH?`)
        if (answer) {
            http.post('delete-virement/' + v.id)
                .then(response => {
                    setState(state => ({
                        ...state,
                        virements: state.virements.filter(vir => vir.id !== v.id)
                    }))
                })
                .catch(err => {
                    console.log(err);
                })
        }

    }

    const loadVirements = (url: string) => {
        http.get(url)
            .then(response => {
                if (response.status === 200) {
                    console.log(response)
                    setState({
                        ...state,
                        virements: response.data._embedded.virmentMultiples?.map((v: Virement) => ({
                            id: v.id,
                            dateCreation: v.dateCreation,
                            motif: v.motif,
                            statut: v.statut,
                            montant: v.montant.toFixed(2),
                            dateExcecution: v.dateExcecution,
                            abonne: { username: v.abonne.username, nom: v.abonne.nom, prenom: v.abonne.prenom },
                            compte: {
                                id: v.compte.id,
                                numeroCompte: v.compte.numeroCompte,
                                intitule: v.compte.intitule,
                                soldeComptable: v.compte.soldeComptable,
                                _links: v.compte._links
                            },
                            _links: v._links
                        }))
                    })
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
    const onChangeCompte = (event: any) => {
        let url: string = event.target.value + "/virments?projection=virProj";
        loadVirements(url)
    }

    const loadComptes = () => {
        if (userId) {
            http.get("abonnes/" + userId + "/comptes")
                .then(response => {
                    if (response.status === 200) {
                        setState(state => (
                            {
                                ...state, comptes: response.data._embedded.comptes.map((e: Compte) => ({
                                    id: e.id,
                                    intitule: e.intitule,
                                    numeroCompte: e.numeroCompte,
                                    soldeComptable: e.soldeComptable,
                                    _links: e._links
                                }))
                            }
                        ))
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }

    }

    const modifyVirement = (v: Virement) => {
        console.log(v);
        history.push(
            {
                pathname: '/ajouter-virement',
                state: {
                    id: v.id
                }
            }
        )
    }

    const filterVirementList = (data: any) => {
        data.compteNumero = data.compteNumero.toString().split('/')[(data.compteNumero.toString().split('/').length) - 1];
        http.post("filter-virement", data)
            .then(response => {
                if (response.status === 200) {
                    setState({
                        ...state,
                        virements: response.data?.map((v: Virement) => ({
                            id: v.id,
                            dateCreation: v.dateCreation,
                            motif: v.motif,
                            statut: v.statut,
                            montant: v.montant,
                            dateExcecution: v.dateExcecution,
                            abonne: { username: v.abonne.username, nom: v.abonne.nom, prenom: v.abonne.prenom },
                            compte: {
                                id: v.compte.id,
                                numeroCompte: v.compte.numeroCompte,
                                intitule: v.compte.intitule,
                                soldeComptable: v.compte.soldeComptable
                            }
                        }))
                    })
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        loadComptes()
    }, []);

    return (
        <Fragment>

            {/*{token ? null : <Redirect to="/auth"/>}*/}

            <Container className="mt-4">
                <FilteringForm comptes={state.comptes} onChangeCompte={(onChangeCompte)}
                    filterVirementList={filterVirementList} />
                <br />
                <h4>Liste de vos virements multiple</h4>
                <br />
                <VirementTable virements={state.virements} deletVirement={deleteVirement}
                    modifyVirement={modifyVirement} />

            </Container>

        </Fragment>
    )
}

export const VirementTable = (props: { virements: Virement[], deletVirement: Function, modifyVirement: Function }) => {

    const spanStyle = {
        color: 'blue',
        textDecoration: 'underline',
    };
    return (

        <Table bordered hover responsive>
            <thead className="thead-dark">
                <tr>
                    <th>Identifiant</th>
                    <th>Date Creation</th>
                    <th>Compte</th>
                    <th>Montant</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>

                {
                    props.virements ? props.virements?.map(v => {
                        return (
                            <tr key={v.id}>
                                <td>{v.id}</td>
                                <td>{v.dateCreation.toString().split('T')[0]}</td>
                                <td><span
                                    style={spanStyle}>{v.compte.numeroCompte + ' ' + v.compte.intitule.toUpperCase() + ' ' +
                                        v.abonne.nom.toUpperCase() + ' ' + v.abonne.prenom.toUpperCase()}</span>
                                </td>
                                <td>{v.montant.toFixed(2)}</td>
                                <td>{v.motif}</td>
                                <td>{v.statut}</td>
                                <td>
                                    {
                                        !v.dateExcecution ?
                                            <Container>
                                                <Row className="justify-content-md-center">
                                                    <Button variant="outline-primary">
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                    <Button variant="outline-success"
                                                        onClick={() => props.modifyVirement(v)}>
                                                        <FontAwesomeIcon icon={faPencilAlt} />
                                                    </Button>
                                                    <Button variant="outline-danger"
                                                        onClick={() => props.deletVirement(v)}>
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </Button>
                                                </Row>
                                            </Container>
                                            : ""
                                    }
                                </td>
                            </tr>
                        )
                    }) : <tr>
                            <td colSpan={7}>No Data</td>
                        </tr>
                }
            </tbody>
        </Table>
    )
}
export const FilteringForm = (props: { comptes: Compte[], onChangeCompte: Function, filterVirementList: Function }) => {
    const { register, errors, handleSubmit } = useForm<any>();

    const onSubmit = (data: any) => {
        console.log(data)
        props.filterVirementList(data);
    }
    return (

        <Form onSubmit={handleSubmit(onSubmit)} id="searchForm">
            <Form.Row>

                <Form.Group as={Col} controlId="formGridCompte">
                    <Form.Label>Numero Compte</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faCreditCard} />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control as="select" name="compteNumero" ref={register({})}
                            onChange={(e) => props.onChangeCompte(e as any)}>
                            <option></option>
                            {
                                props.comptes.map((e: Compte) => {
                                    return <option key={e.id}
                                        value={e._links.self.href}>{e.numeroCompte}
                                    </option>
                                })
                            }
                        </Form.Control>
                    </InputGroup>
                </Form.Group>

                <Form.Group as={Col} controlId="formGridDateCreation">
                    <Form.Label>Date d'éxécution :</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control name="dateCreation" ref={register({})} type="date" />
                    </InputGroup>
                </Form.Group>

                <Form.Group as={Col} controlId="formGridDateExecution">
                    <Form.Label>Date d'éxécution :</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control name="dateExecution" ref={register({})} type="date" />
                    </InputGroup>
                </Form.Group>

            </Form.Row>

            <Form.Row>

                <Form.Group as={Col} controlId="formGridMontantMin">
                    <Form.Label>Montant min :</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faDollarSign} />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control name="montantMin" ref={register({
                            validate: (n: number) => n > 0
                        })} type="number" />
                        {
                            (errors.montantMax?.type === 'validate') ?
                                <Alert className='mt-2' variant="danger">Le montant doit être supérieur a 0
                                !!!</Alert> : null
                        }
                    </InputGroup>
                </Form.Group>

                <Form.Group as={Col} controlId="formGridMontantMax">
                    <Form.Label>Montant max :</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faDollarSign} />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control name="montantMax" ref={register({
                            validate: (n: number) => n > 0
                        })} type="number" />
                        {
                            (errors.montantMax?.type === 'validate') ?
                                <Alert className='mt-2' variant="danger">Le montant doit être supérieur a 0
                                !!!</Alert> : null
                        }
                    </InputGroup>
                </Form.Group>

                <Form.Group as={Col} controlId="formGridStatut">
                    <Form.Label>Statut</Form.Label>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faAdjust} />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control as="select" name="statut" ref={register({})} defaultValue="Choose...">
                            <option></option>
                            <option>Enregistré</option>
                            <option>Signé et Enregistré</option>
                        </Form.Control>
                    </InputGroup>
                </Form.Group>

            </Form.Row>

            <Form.Row>
                <Form.Group as={Col} controlId="formRecheche">
                    <Button variant="warning" type="submit">Rechercher</Button>
                </Form.Group>
            </Form.Row>

        </Form>
    )
}

export default VirementList;