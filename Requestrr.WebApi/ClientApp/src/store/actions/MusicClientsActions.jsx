export const GET_SETTINGS = "musicClients:get_settings";
export const SET_DISABLED_CLIENT = "musicClients:set_disabled_client";


export function setSettings(settings) {
    return {
        type: GET_SETTINGS,
        payload: settings
    };
};


export function setDisabledClient() {
    return {
        type: SET_DISABLED_CLIENT
    };
};


export function getSettings() {
    return (dispatch, getState) => {
        const state = getState();

        return fetch("../api/music", {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.user.token}`
            }
        })
            .then(data => data.json())
            .then(data => dispatch(setSettings(data)));
    };
};



export function saveDisabledClient() {
    return (dispatch, getState) => {
        const state = getState();
        
        return fetch("../api/music/disable", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.user.token}`
            },
        })
            .then(data => data.json())
            .then(data => {
                if (data.ok) {
                    dispatch(setDisabledClient());
                    return { ok: true };
                }

                return { ok: false, error: data };
            });
    };
};