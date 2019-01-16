import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';

import { connect } from 'react-redux';
import * as userActions from '../actions/userActions';
import * as messageActions from '../actions/messageActions';

import { MessageHelper } from '../helpers/MessageHelper';

class App extends Component {
	componentDidMount() {
		this.props.fetchUser();
		this.props.fetchMessage();
	}

	render() {
		const { message } = this.props;

		const 	_error 		= message ? (message.error.error ? message.error.text : null) : null,
		 		_message 	= message ? (message.message.message ? message.message.text : null) : null;

		return (
			<div className="App">
				<BrowserRouter>
					<div>
						{ _message && MessageHelper.message(_message) }
						{ _error && MessageHelper.error(_error) }
						<Switch>
							<Route render={props => <h1 {...props}>HelloWorld!</h1>} />
						</Switch>
					</div>
				</BrowserRouter>
			</div>
		)
	}
}

function mapUserAndMessageToProps({ user, message }) {
	return { user, message };
}

export default connect(mapUserAndMessageToProps, {...userActions, ...messageActions})(App);