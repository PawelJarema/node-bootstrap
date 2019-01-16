import { getMessage } from './functions';

export const fetchMessage = () => async dispatch => {
	getMessage(dispatch);
}