
import { useEffect, useState } from "react";
import { Oval } from 'react-loader-spinner'
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from "reactstrap";
import { testOverseerrTvShowSettings as testSettings } from "../../../../store/actions/OverseerrClientSonarrActions"
import { setOverseerrTvShowConnectionSettings as setConnectionSettings } from "../../../../store/actions/OverseerrClientSonarrActions"
import ValidatedTextbox from "../../../Inputs/ValidatedTextbox"
import Dropdown from "../../../Inputs/Dropdown"
import OverseerrTvShowCategoryList from "./OverseerrTvShowCategoryList"

import {
  FormGroup,
  Input,
  Row,
  Col
} from "reactstrap";


function OverseerrTvShow(props) {

  const [isTestingSettings, setIsTestingSettings] = useState(false);
  const [testSettingsRequested, setTestSettingsRequested] = useState(false);
  const [testSettingsSuccess, setTestSettingsSuccess] = useState(false);
  const [testSettingsError, setTestSettingsError] = useState("");
  const [hostname, setHostname] = useState("");
  const [isHostnameValid, setIsHostnameValid] = useState(false);
  const [port, setPort] = useState("7878");
  const [isPortValid, setIsPortValid] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [defaultApiUserID, setDefaultApiUserID] = useState("");
  const [isDefaultApiUserIDValid, setIsDefaultApiUserIDValid] = useState(true);
  const [useSSL, setUseSSL] = useState("");
  const [useTVIssue, setUseTVIssue] = useState("");
  const [apiVersion, setApiVersion] = useState("");
  const [isValid, setIsValid] = useState(false);

  const reduxState = useSelector((state) => {
    return {
      settings: state.tvShows.overseerr,
      otherCategories: state.tvShows.otherCategories
    }
  });
  const dispatch = useDispatch();


  useEffect(() => {
    updateStateFromProps();
  }, []);


  useEffect(() => {
    onValueChange();
  }, [apiVersion, apiKey, hostname, port, defaultApiUserID, useSSL, useTVIssue]);




  const validateNonEmptyString = (value) => {
    return /\S/.test(value);
  };

  const validatePort = (value) => {
    return /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(value);
  };

  const validateDefaultUserId = (value) => {
    return (!value || value.length === 0 || /^\s*$/.test(value)) || (/^[1-9]\d*$/).test(value);
  };



  const updateStateFromProps = () => {
    setIsTestingSettings(false);
    setTestSettingsRequested(false);
    setTestSettingsSuccess(false);
    setTestSettingsError("");
    setHostname(reduxState.settings.hostname);
    setIsHostnameValid(false);
    setPort(reduxState.settings.port);
    setIsPortValid(false);
    setApiKey(reduxState.settings.apiKey);
    setIsApiKeyValid(false);
    setDefaultApiUserID(reduxState.settings.defaultApiUserID);
    setIsDefaultApiUserIDValid(true);
    setUseSSL(reduxState.settings.useSSL);
    setUseTVIssue(reduxState.settings.useTVIssue);
    setApiVersion(reduxState.settings.version);
    setIsValid(false);
  };


  const onTestSettings = (e) => {
    e.preventDefault();

    if (!isTestingSettings
      && isHostnameValid
      && isPortValid
      && isDefaultApiUserIDValid
      && isApiKeyValid) {
      setIsTestingSettings(true);

      dispatch(testSettings({
        hostname: hostname,
        port: port,
        apiKey: apiKey,
        useSSL: useSSL,
        DefaultApiUserID: defaultApiUserID,
        version: apiVersion,
      }))
        .then(data => {
          setIsTestingSettings(false);

          if (data.ok) {
            setTestSettingsRequested(true);
            setTestSettingsError("");
            setTestSettingsSuccess(true);
          } else {
            let error = "An unknown error occurred while testing the settings";

            if (typeof (data.error) === "string")
              error = data.error;

            setTestSettingsRequested(true);
            setTestSettingsError(error);
            setTestSettingsSuccess(false);
          }
        });
    }
  };


  const onUseSSLChanged = (event) => {
    setUseSSL(!useSSL);
  };

  const onUseTVIssueChanged = (event) => {
    setUseTVIssue(!useTVIssue);
  };

  const onValueChange = () => {
    dispatch(setConnectionSettings({
      hostname: hostname,
      port: port,
      apiKey: apiKey,
      useSSL: useSSL,
      useTVIssue: useTVIssue,
      version: apiVersion,
    }));

    props.onChange({
      hostname: hostname,
      port: port,
      apiKey: apiKey,
      defaultApiUserID: defaultApiUserID,
      useSSL: useSSL,
      useTVIssue: useTVIssue,
      version: apiVersion,
    });

    onValidate();
  };

  const onValidate = () => {
    let newIsValid = isApiKeyValid
      && isHostnameValid
      && isPortValid
      && isDefaultApiUserIDValid
      && (reduxState.settings.categories.length === 0 || (reduxState.settings.categories.every(x => validateCategory(x)) && reduxState.settings.isSonarrServiceSettingsValid));

    if (newIsValid !== isValid) {
      setIsValid(newIsValid);
      props.onValidate(newIsValid);
    }
  };


  const validateCategory = (category) => {
    if (!/\S/.test(category.name)) {
      return false;
    } else if (/^[\w-]{1,32}$/.test(category.name)) {
      let names = reduxState.settings.categories.map(x => x.name);
      let matchedMovie = reduxState.otherCategories.filter(x => x.toLowerCase() === category.name.toLowerCase());

      if (new Set(names).size !== names.length) {
        return false;
      } else if (reduxState.settings.sonarrServiceSettings.sonarrServices.every(x => x.id !== category.serviceId) || matchedMovie.length !== 0) {
        return false;
      } else {
        let sonarrService = reduxState.settings.sonarrServiceSettings.sonarrServices.filter(x => x.id === category.serviceId)[0];

        if (sonarrService.profiles.length === 0 || sonarrService.rootPaths.length === 0) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  };



  onValidate();



  return (
    <>
      <div>
        <h6 className="heading-small text-muted mb-4">
          Overseerr Connection Settings
        </h6>
      </div>
      <div className="pl-lg-4">
        <Row>
          <Col lg="6">
            <Dropdown
              name="API"
              value={apiVersion}
              items={[{ name: "Version 1", value: "1" }]}
              onChange={newApiVersion => setApiVersion(newApiVersion)} />
          </Col>
          <Col lg="6">
            <ValidatedTextbox
              name="API Key"
              placeholder="Enter api key"
              alertClassName="mt-3"
              errorMessage="api key is required."
              isSubmitted={props.isSubmitted}
              value={apiKey}
              validation={validateNonEmptyString}
              onChange={newApiKey => setApiKey(newApiKey)}
              onValidate={valid => setIsApiKeyValid(valid)} />
          </Col>
        </Row>
        <Row>
          <Col lg="6">
            <ValidatedTextbox
              name="Host or IP"
              placeholder="Enter host or ip"
              alertClassName="mt-3 mb-0"
              errorMessage="Hostname is required."
              isSubmitted={props.isSubmitted}
              value={hostname}
              validation={validateNonEmptyString}
              onChange={newHostname => setHostname(newHostname)}
              onValidate={valid => setIsHostnameValid(valid)} />
          </Col>
          <Col lg="6">
            <ValidatedTextbox
              name="Port"
              placeholder="Enter port"
              alertClassName="mt-3 mb-0"
              errorMessage="Please enter a valid port."
              isSubmitted={props.isSubmitted}
              value={port}
              validation={validatePort}
              onChange={newPort => setPort(newPort)}
              onValidate={valid => setIsPortValid(valid)} />
          </Col>
        </Row>
        <Row>
          <Col lg="6">
            <ValidatedTextbox
              name="Default Overseerr User ID for requests"
              placeholder="Enter default user ID (Optional)"
              alertClassName="mt-3 mb-0"
              errorMessage="The user id must be a number."
              isSubmitted={props.isSubmitted}
              value={defaultApiUserID}
              validation={validateDefaultUserId}
              onChange={newDefaultApiUserID => setDefaultApiUserID(newDefaultApiUserID)}
              onValidate={valid => setIsDefaultApiUserIDValid(valid)} />
          </Col>
          <Col lg="6"></Col>
        </Row>
        <Row>
          <Col lg="6">
            <FormGroup className="custom-control custom-control-alternative custom-checkbox mb-3">
              <Input
                className="custom-control-input"
                id="useSSL"
                type="checkbox"
                onChange={onUseSSLChanged}
                checked={useSSL}
              />
              <label
                className="custom-control-label"
                htmlFor="useSSL">
                <span className="text-muted">Use SSL</span>
              </label>
            </FormGroup>
          </Col>
          <Col lg="6">
            <a href="https://github.com/thomst08/requestrr/wiki/Configuring-Overseerr#configuring-permissions" target="_blank" rel="noreferrer">Click here to view how configure Overseerr permissions with the bot</a>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup className="mt-4">
              {
                testSettingsRequested && !isTestingSettings ?
                  !testSettingsSuccess ? (
                    <Alert className="text-center" color="danger">
                      <strong>{testSettingsError}</strong>
                    </Alert>)
                    : <Alert className="text-center" color="success">
                      <strong>The specified settings are valid.</strong>
                    </Alert>
                  : null
              }
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup className="text-right">
              <button onClick={onTestSettings} disabled={!isHostnameValid || !isPortValid || !isApiKeyValid || !isDefaultApiUserIDValid} className="btn btn-icon btn-3 btn-default" type="button">
                <span className="btn-inner--icon">
                  {
                    isTestingSettings ? (
                      <Oval
                        wrapperClass="loader"
                        type="Oval"
                        color="#11cdef"
                        height={19}
                        width={19}
                      />)
                      : (<i className="fas fa-cogs"></i>)
                  }</span>
                <span className="btn-inner--text">Test Settings</span>
              </button>
            </FormGroup>
          </Col>
        </Row>
      </div>
      <OverseerrTvShowCategoryList isSubmitted={props.isSubmitted} isSaving={props.isSaving} apiVersion={apiVersion} canConnect={isHostnameValid && isPortValid && isApiKeyValid} />
      <h6 className="heading-small text-muted">
        Enable Issues
      </h6>
      <div>
        <Col lg="6">
          <FormGroup className="custom-control custom-control-alternative custom-checkbox mb-3">
            <Input
              className="custom-control-input"
              id="useTVIssue"
              type="checkbox"
              onChange={onUseTVIssueChanged}
              checked={useTVIssue}
            />
            <label
              className="custom-control-label"
              htmlFor="useTVIssue">
              <span className="text-muted">Use Issues</span>
            </label>
          </FormGroup>
        </Col>
      </div>
      <hr className="my-4" />
    </>
  );
}

export default OverseerrTvShow;