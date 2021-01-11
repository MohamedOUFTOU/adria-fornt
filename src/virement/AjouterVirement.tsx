import React, {ChangeEvent, Fragment, useEffect, useState} from 'react';
import {Alert, Button, Col, Form, FormControl, InputGroup, Row, Table} from "react-bootstrap";
import {useForm} from "react-hook-form";

import http from '../app/Client'
import {Redirect, useHistory, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import {GlobalState} from "../app/types";

type Beneficiaire = {
    id: number,
    nom: string,
    prenom: string,
    numeroCompte: number
}

type SelectedBeneficiaire = {
    id: number,
    nom: string,
    prenom: string,
    montant: number
}
type Compte = {
    id: number,
    intitule: string
    numeroCompte: string
    soldeComptable: number
}


export const ListBeneficiaires = (props: { beneficiaires: Beneficiaire[], addBeneficiaire: Function }) => {
    return (
        <Table>
            <thead>
            <tr>
                <th>Identifiant</th>
                <th>Némero de compte</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {
                props.beneficiaires?.length ? props.beneficiaires?.map(beneficiaire => {
                    return (
                        <tr key={beneficiaire.id}>
                            <td>{beneficiaire.id}</td>
                            <td>{`${beneficiaire.numeroCompte} ${beneficiaire.nom.toUpperCase()} ${beneficiaire.prenom.toUpperCase()}`}</td>
                            <td>
                                <Button variant="success" size="sm"
                                        onClick={() => props.addBeneficiaire(beneficiaire)}>+</Button>
                            </td>
                        </tr>)
                }) : <tr>
                    <td colSpan={3}>Vous n'avez aucun bénéficiaire</td>
                </tr>
            }

            </tbody>
        </Table>
    )
}
export const BeneficiairesVirement = (props: { selectedBeneficiaire: SelectedBeneficiaire[], removeBeneficiaire: Function, changeBeneficiaireValuer: Function }) => {
    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        props.changeBeneficiaireValuer(e.target.name, e.target.value)
    }
    return <Table>
        <thead>
        <tr>
            <th>Identifiant</th>
            <th>Bénéficiaires</th>
            <th>Montant</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {
            props.selectedBeneficiaire?.length ? props.selectedBeneficiaire.map(beneficiaire => {
                return (
                    <tr key={beneficiaire.id}>
                        <td>{beneficiaire.id}</td>
                        <td>{`${beneficiaire.nom?.toUpperCase()} ${beneficiaire.prenom?.toUpperCase()}`}</td>
                        <td>
                            <input style={{borderColor: beneficiaire.montant ? '' : 'red'}}
                                   type="number" name={beneficiaire.id.toString()}
                                   value={beneficiaire.montant}
                                   onChange={changeHandler}/>
                            {
                                (beneficiaire.montant <= 0) ?
                                    <Alert className='mt-2' variant="danger">Valeur doit être non nulle</Alert> : null
                            }

                        </td>
                        <td><Button variant="danger" size="sm"
                                    onClick={() => props.removeBeneficiaire(beneficiaire.id)}>-</Button>
                        </td>
                    </tr>)
            }) : <tr>
                <td colSpan={4}>Veuillez sélectionner un bénéficiaire</td>
            </tr>
        }
        </tbody>
    </Table>
}
export const VirementForm = (props: any) => {
    const history = useHistory();
    const {register, errors, handleSubmit} = useForm<any>();
    const onSubmit = (data: any) => {
        let isValid = true;
        props.state.selectedBeneficiaire.forEach((e: SelectedBeneficiaire) => {
            if (+e.montant === 0) {
                isValid = false;
            }
        })
        if (isValid) {
            const url = props.state.updateMode ? 'modifier-virement/' + props.state.id : 'ajouter-virement';
            const submitForm =
                {
                    ...data,
                    selectedBeneficiaire: props.state.selectedBeneficiaire

                }
            http.post(url, submitForm).then(response => {
                const detail = {
                    id: response.data,
                    ...submitForm
                };
                history.push({
                    pathname: '/verification',
                    state: {detail}
                });
            }).catch(error => {
                console.log(error)
            })

        }
    };

    const checkForBalance = (numeroCompte: string) => {
        const index = (props.state.comptes as Compte[]).findIndex(e => e.numeroCompte === numeroCompte)
        if (index !== -1) {
            return props.state.comptes[index].soldeComptable >= props.state.montant
        }
        return false
    }
    const display_date = new Date().toISOString().split('T')[0]
    return <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
            <Col className="col-6">
                <Form.Group controlId="select">
                    <Form.Label>Choisir un compte :</Form.Label>
                    <Form.Control as="select"
                                  defaultValue={props.state.updateMode ? props.state.comptes.filter((c: Compte) => c.numeroCompte === props.state.virement.accountNumber) : props.state.comptes[0]}
                                  name="accountNumber" ref={register({
                        required: true,
                        validate: checkForBalance
                    })}>
                        {
                            props.state.comptes.map((e: Compte) => {
                                return <option key={e.id}
                                               value={e.numeroCompte}>{e.numeroCompte + ' : (' + e.soldeComptable} DH)
                                </option>
                            })
                        }
                    </Form.Control>
                    {
                        (errors.accountNumber?.type === 'required') ?
                            <Alert className='mt-2' variant="danger">{"Vous devez spécifier un compte"}</Alert> : null
                    }
                    {
                        (errors.accountNumber?.type === 'validate') ?
                            <Alert className='mt-2'
                                   variant="danger">{"Assurez-vous d'avoir suffisamment d'argent sur votre compte pour cette opération"}</Alert> : null
                    }
                </Form.Group>
            </Col>
            <Col>
                <Form.Group controlId="DateDeCreation">
                    <Form.Label>Date de création</Form.Label>
                    <Form.Control type="text" name="createdDate"
                                  ref={register({required: true})}
                                  value={props.state.updateMode ? props.state.virement.createdDate.toString().split('T')[0] : display_date}
                                  readOnly/>
                </Form.Group>
                {
                    (errors.createdDate?.type === 'required') ?
                        <Alert className='mt-2' variant="danger">{"Error"}</Alert> : null
                }
            </Col>
        </Row>
        {/*<Row>*/}
        {/*    <Col>*/}
        {/*        <Form.Group controlId="DateDeExecution">*/}
        {/*            <Form.Label>Date d'exécution</Form.Label>*/}
        {/*            <Form.Control type="date"*/}
        {/*                          name="executedDate"*/}
        {/*                          ref={register({required: true})}*/}
        {/*            />*/}
        {/*        </Form.Group>*/}
        {/*        {*/}
        {/*            (errors.executedDate?.type === 'required') ?*/}
        {/*                <Alert className='mt-2' variant="danger">Vous devez spécifier une date</Alert> : null*/}
        {/*        }*/}
        {/*    </Col>*/}
        {/*</Row>*/}
        <Row>
            <Col>
                <Form.Group controlId="motif">
                    <Form.Label>Motif</Form.Label>
                    <Form.Control type="text" name="motif"
                                  defaultValue={props.state.updateMode ? props.state.virement.motif : ''}
                                  ref={register({required: true})}/>
                </Form.Group>
                {
                    (errors.motif?.type === 'required') ?
                        <Alert className='mt-2' variant="danger">Vous devez spécifier un motif</Alert> : null
                }
            </Col>
            <Col>

                <Form.Group controlId="NombreDeBeneficiaires">
                    <Form.Label>Nombre de bénéficiaires</Form.Label>
                    <Form.Control type="number" name="nbrOfBenf"
                                  defaultValue={props.state.virement.nbrOfBenf}
                                  ref={register({
                                      required: true,
                                      validate: (n: number) => +n === props.state.selectedBeneficiaire.length,
                                  })}/>
                </Form.Group>
                {
                    (errors.nbrOfBenf?.type === 'validate') ?
                        <Alert className='mt-2' variant="danger">Le nombre de bénéficiaires sélectionnés
                            ne correspond pas au nombre saisi</Alert> : null
                }
                {
                    (errors.nbrOfBenf?.type === 'required') ?
                        <Alert className='mt-2' variant="danger">Vous devez spécifier le nombre des
                            bénéficiaires</Alert> : null
                }
            </Col>
            <Col>
                <Form.Group controlId="Montant">
                    <Form.Label>Montant</Form.Label>
                    <InputGroup className="mb-3">
                        <FormControl
                            type="number" value={props.state.montant} name="montant"
                            ref={register({
                                required: true,
                                min: 1,
                            })} readOnly
                        />
                        <InputGroup.Append>
                            <InputGroup.Text id="basic-addon2">DH</InputGroup.Text>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
                {
                    (errors.montant?.type === 'min') ?
                        <Alert className='mt-2' variant="danger">Vous devez choisir des bénéficiaires </Alert> : null
                }
            </Col>
        </Row>
        <Row>
            <Col>
                <Button type="submit">{props.state.updateMode ? 'Update' : 'Save'}</Button>
            </Col>
        </Row>
    </Form>
}

const AjouterVirment = () => {
    const selectedBeneficiaire: SelectedBeneficiaire[] = [];
    const beneficiaire: Beneficiaire[] = [];
    const comptes: Compte[] = [];
    const location = useLocation();
    const virement: any[] = [];
    const updateMode: boolean = false;
    const
        [state, setState] = useState({
            beneficiaire: beneficiaire,
            selectedBeneficiaire: selectedBeneficiaire,
            montant: 0,
            comptes: comptes,
            updateMode: updateMode,
            virement: virement,
            id: -1
        });
    useEffect(() => {
        let data: any = {...location.state}

        http.get('/abonnes/' + userId + '/beneficiaires').then(response => {
            console.log(response)
            setState(state => (
                {
                    ...state, beneficiaire: response.data._embedded.beneficiaires.map((e: Beneficiaire) => ({
                        prenom: e.prenom, nom: e.nom, id: e.id, numeroCompte: e.numeroCompte
                    }))
                }
            ))
        });
        http.get('/abonnes/' + userId + '/comptes').then(response => {
            setState(state => (
                {
                    ...state, comptes: response.data._embedded.comptes.map((e: Compte) => ({
                        id: e.id, intitule: e.intitule, numeroCompte: e.numeroCompte, soldeComptable: e.soldeComptable
                    }))
                }
            ))
        });
        if (data.id) {
            http.get("get-virement/" + data.id)
                .then(response => {
                    console.log(response.data)
                    setState(state => ({
                        ...state,
                        montant: response.data.montant,
                        updateMode: true,
                        selectedBeneficiaire: response.data.selectedBeneficiaire?.map((b: SelectedBeneficiaire) => ({
                            id: b.id,
                            montant: b.montant,
                            nom: b.nom,
                            prenom: b.prenom
                        })),
                        virement: response.data,
                        id: data.id
                    }))
                })
                .catch(err => {
                    console.log(err)
                })
        }

    }, [])
    const addBeneficiaire = (data: Beneficiaire) => {
        if (!state.selectedBeneficiaire.some(selectedBeneficiaire => selectedBeneficiaire.id === data.id)) {
            setState({
                ...state,
                selectedBeneficiaire: state.selectedBeneficiaire.concat({
                    montant: 0,
                    id: data.id,
                    nom: data.nom,
                    prenom: data.prenom
                })
            })
        }
    }
    const removeBeneficiaire = (data: number) => {
        const e = state.selectedBeneficiaire.find(e => +e.id === +data)
        let amount = +state.montant
        if (e) {
            amount -= e?.montant
        }
        setState({
            ...state,
            montant: amount,
            selectedBeneficiaire: state.selectedBeneficiaire.filter(b => b.id !== data)
        })

    }
    const changeBeneficiaireValuer = (id: number, value: number) => {
        if (+value > 0) {
            state.selectedBeneficiaire.forEach(e => {
                if (e.id === +id) {
                    const amount = +state.montant - +e.montant + +value
                    e.montant = value > 0 ? value : 0;
                    setState({
                        ...state,
                        montant: amount > 0 ? amount : 0,
                        selectedBeneficiaire: [...state.selectedBeneficiaire]
                    })
                    return;
                }
            })
        }

    }
    const {userId, token} = useSelector(
        (state: GlobalState) => state.auth
    );
    return (
        <Fragment>
            <!-- {token ? null : <Redirect to="/auth"/>} -->
            <h1>Virement</h1>
            <Row className="mt-4">
                <Col>
                    <ListBeneficiaires beneficiaires={state.beneficiaire}
                                       addBeneficiaire={addBeneficiaire}/>
                </Col>
                <Col>
                    <BeneficiairesVirement selectedBeneficiaire={state.selectedBeneficiaire}
                                           removeBeneficiaire={removeBeneficiaire}
                                           changeBeneficiaireValuer={changeBeneficiaireValuer}/>
                </Col>
            </Row>
            <Row className="m-auto">
                <Col>
                    <VirementForm state={state}/>
                </Col>
            </Row>
        </Fragment>
    );
}

export default AjouterVirment;
