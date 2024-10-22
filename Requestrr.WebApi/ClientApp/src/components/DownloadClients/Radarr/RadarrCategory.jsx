
import { useEffect, useRef, useState } from "react";
import { Oval } from 'react-loader-spinner'
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from "reactstrap";
import { loadRadarrProfiles as loadProfiles } from "../../../store/actions/RadarrClientActions"
import { loadRadarrRootPaths as loadRootPaths } from "../../../store/actions/RadarrClientActions"
import { loadRadarrTags as loadTags } from "../../../store/actions/RadarrClientActions"
import { setRadarrCategory } from "../../../store/actions/RadarrClientActions"
import { removeRadarrCategory } from "../../../store/actions/RadarrClientActions"
import ValidatedTextbox from "../../Inputs/ValidatedTextbox"
import Dropdown from "../../Inputs/Dropdown"
import MultiDropdown from "../../Inputs/MultiDropdown"

import {
  Row,
  Col,
  Collapse
} from "reactstrap";


function RadarrCategory(props) {
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const propRef = useRef();

  const reduxState = useSelector((state) => {
    return {
      radarr: state.movies.radarr,
      otherCategories: state.movies.otherCategories
    }
  });
  const dispatch = useDispatch();


  useEffect(() => {
    if (props.category.wasCreated)
      setIsOpen(true);

    if (props.canConnect) {
      dispatch(loadProfiles(false));
      dispatch(loadRootPaths(false));
      dispatch(loadTags(false));
    }
  }, []);


  useEffect(() => {
    const prevState = propRef.pastState;
    propRef.pastState = reduxState;
    const prevProps = propRef.past;
    propRef.past = props;

    let previousNames = prevState === undefined ? [] : prevState.radarr.categories.map(x => x.name);
    let currentNames = reduxState.radarr.categories.map(x => x.name);

    if (!(previousNames.length === currentNames.length && currentNames.every((value, index) => previousNames[index] === value)))
      validateName(props.category.name)

    if (props.canConnect) {
      dispatch(loadProfiles(false));
      dispatch(loadRootPaths(false));
      dispatch(loadTags(false));
    }

    if (prevProps?.isSaving !== props.isSaving)
      setIsOpen(false)
  });




  // const validateNonEmptyString = (value) => {
  //   return /\S/.test(value);
  // }

  const validateName = (value) => {
    let newIsNameValid = true;
    let newNameErrorMessage = undefined;

    if (!/\S/.test(value)) {
      newNameErrorMessage = "A category name is required.";
      newIsNameValid = false;
    } else if (/^[\w-]{1,32}$/.test(value)) {
      if (reduxState.radarr.categories.map(x => x.id).includes(props.category.id) && reduxState.radarr.categories.filter(c => typeof c.id !== 'undefined' && c.id !== props.category.id && c.name.toLowerCase().trim() === value.toLowerCase().trim()).length > 0) {
        newNameErrorMessage = "All categories must have different names.";
        newIsNameValid = false;
      } else if (reduxState.otherCategories.filter(c => c.toLowerCase().trim() === value.toLowerCase().trim()).length > 0) {
        newNameErrorMessage = "This category has matched a category in TV Shows or Music, this must have different names.";
        newIsNameValid = false;
      }
    } else {
      newNameErrorMessage = "Invalid categorie names, make sure they only contain alphanumeric characters, dashes and underscores. (No spaces, etc)";
      newIsNameValid = false;
    }

    setIsNameValid(newIsNameValid);
    if (newNameErrorMessage !== undefined)
      setNameErrorMessage(newNameErrorMessage);

    return newIsNameValid;
  };




  const setCategory = (fieldChanged, data) => {
    dispatch(setRadarrCategory(props.category.id, fieldChanged, data));
  };


  const deleteCategory = () => {
    setIsOpen(false);
    setTimeout(() => dispatch(removeRadarrCategory(props.category.id), 150));
  };




  return (
    <>
      <tr class="fade show">
        <th scope="row">
          <div class="media align-items-center">
            <div class="media-body">
              <span class="name mb-0 text-sm">{props.category.name}</span>
            </div>
          </div>
        </th>
        <td class="text-right">
          <button onClick={() => setIsOpen(!isOpen)} disabled={isOpen && (!isNameValid || !reduxState.radarr.arePathsValid || !reduxState.radarr.areProfilesValid || !reduxState.radarr.areTagsValid)} className="btn btn-icon btn-3 btn-info" type="button">
            <span className="btn-inner--icon"><i class="fas fa-edit"></i></span>
            <span className="btn-inner--text">Edit</span>
          </button>
        </td>
      </tr>
      <tr>
        <td className="border-0 pb-0 pt-0" colSpan="2">
          <Collapse isOpen={isOpen}>
            <div className="mb-4">
              <Row>
                <Col lg="6">
                  <ValidatedTextbox
                    name="Category Name"
                    placeholder="Enter category name"
                    alertClassName="mt-3 text-wrap"
                    errorMessage={nameErrorMessage}
                    isSubmitted={props.isSubmitted || isNameValid}
                    value={props.category.name}
                    validation={validateName}
                    onChange={newName => setCategory("name", newName)}
                    onValidate={isValid => setIsNameValid(isValid)} />
                </Col>
              </Row>
              <Row>
                <Col lg="6" className="mb-4">
                  <div className="input-group-button">
                    <Dropdown
                      name="Path"
                      value={props.category.rootFolder}
                      items={reduxState.radarr.paths.map(x => { return { name: x.path, value: x.path } })}
                      onChange={newPath => setCategory("rootFolder", newPath)} />
                    <button className="btn btn-icon btn-3 btn-default" onClick={() => dispatch(loadRootPaths(true))} disabled={!props.canConnect} type="button">
                      <span className="btn-inner--icon">
                        {
                          reduxState.radarr.isLoadingPaths ? (
                            <Oval
                              wrapperClass="loader"
                              type="Oval"
                              color="#11cdef"
                              height={19}
                              width={19}
                            />)
                            : (<i className="fas fa-download"></i>)
                        }</span>
                      <span className="btn-inner--text">Load</span>
                    </button>
                  </div>
                  {
                    !reduxState.radarr.arePathsValid ? (
                      <Alert className="mt-3 mb-0 text-wrap " color="warning">
                        <strong>Could not find any paths.</strong>
                      </Alert>)
                      : null
                  }
                  {
                    props.isSubmitted && reduxState.radarr.paths.length === 0 ? (
                      <Alert className="mt-3 mb-0 text-wrap " color="warning">
                        <strong>A path is required.</strong>
                      </Alert>)
                      : null
                  }
                </Col>
                <Col lg="6" className="mb-4">
                  <div className="input-group-button">
                    <Dropdown
                      name="Profile"
                      value={props.category.profileId}
                      items={reduxState.radarr.profiles.map(x => { return { name: x.name, value: x.id } })}
                      onChange={newProfile => setCategory("profileId", newProfile)} />
                    <button className="btn btn-icon btn-3 btn-default" onClick={() => dispatch(loadProfiles(true))} disabled={!props.canConnect} type="button">
                      <span className="btn-inner--icon">
                        {
                          reduxState.radarr.isLoadingProfiles ? (
                            <Oval
                              wrapperClass="loader"
                              type="Oval"
                              color="#11cdef"
                              height={19}
                              width={19}
                            />)
                            : (<i className="fas fa-download"></i>)
                        }</span>
                      <span className="btn-inner--text">Load</span>
                    </button>
                  </div>
                  {
                    !reduxState.radarr.areProfilesValid ? (
                      <Alert className="mt-3 mb-0 text-wrap " color="warning">
                        <strong>Could not find any profiles.</strong>
                      </Alert>)
                      : null
                  }
                  {
                    props.isSubmitted && reduxState.radarr.profiles.length === 0 ? (
                      <Alert className="mt-3 mb-0 text-wrap " color="warning">
                        <strong>A profile is required.</strong>
                      </Alert>)
                      : null
                  }
                </Col>
              </Row>
              <Row>
                <Col lg="6">
                  <Dropdown
                    name="Min Availability"
                    value={props.category.minimumAvailability}
                    items={[{ name: "Announced", value: "announced" }, { name: "In Cinemas", value: "inCinemas" }, { name: "Released", value: "released" }, { name: "PreDB", value: "preDB" }]}
                    onChange={newMinimumAvailability => setCategory("minimumAvailability", newMinimumAvailability)} />
                </Col>
                {
                  props.apiVersion !== "2"
                    ? <>
                      <Col lg="6">
                        <div className="input-group-button mb-4">
                          <MultiDropdown
                            name="Tags"
                            placeholder=""
                            labelField="name"
                            valueField="id"
                            ignoreEmptyItems={true}
                            selectedItems={reduxState.radarr.tags.filter(x => props.category.tags.includes(x.id))}
                            items={reduxState.radarr.tags}
                            onChange={newTags => setCategory("tags", newTags.map(x => x.id))} />
                          <button className="btn btn-icon btn-3 btn-default" onClick={() => dispatch(loadTags(true))} disabled={!props.canConnect} type="button">
                            <span className="btn-inner--icon">
                              {
                                reduxState.radarr.isLoadingTags ? (
                                  <Oval
                                    wrapperClass="loader"
                                    type="Oval"
                                    color="#11cdef"
                                    height={19}
                                    width={19}
                                  />)
                                  : (<i className="fas fa-download"></i>)
                              }</span>
                            <span className="btn-inner--text">Load</span>
                          </button>
                        </div>
                        {
                          !reduxState.radarr.areTagsValid ? (
                            <Alert className="mt-3 mb-4 text-wrap " color="warning">
                              <strong>Could not load tags, cannot reach Radarr.</strong>
                            </Alert>)
                            : null
                        }
                      </Col>
                    </>
                    : null
                }
              </Row>
              {
                reduxState.radarr.categories.length > 1
                  ? <Row>
                    <Col lg="12" className="text-right">
                      <button onClick={() => deleteCategory()} className="btn btn-icon btn-3 btn-danger" type="button">
                        <span className="btn-inner--icon"><i class="fas fa-trash"></i></span>
                        <span className="btn-inner--text">Remove</span>
                      </button>
                    </Col>
                  </Row>
                  : null
              }
            </div>
          </Collapse>
        </td>
      </tr>
    </>
  );
}

export default RadarrCategory;