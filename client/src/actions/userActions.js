import axios from 'axios';
import { FETCH_USER } from './types';
import { getMessage } from './functions';

export const fetchUser = () => async dispatch => {
	const res = await axios.get('/auth/fetchUser');
	dispatch({ type: FETCH_USER, payload: res.data });
}