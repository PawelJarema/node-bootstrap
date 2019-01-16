import { FETCH_MESSAGE } from '../actions/types';

export default function (state = null, action) {
	switch (action.type) {
		case FETCH_MESSAGE:
			return action.payload || false;
		default:
			return state;
	}
}