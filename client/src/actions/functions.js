import axios from 'axios';
import { FETCH_MESSAGE } from './types';

export async function getMessage(dispatch) {
	const message = await axios.get('/api/message');
	dispatch({ type: FETCH_MESSAGE, payload: message.data });
}