import React from 'react'

class ComboDisplayItem extends React.Component {

	render() {

		return (
			<div>{this.props.item[this.props.itemDisplayProperty]}</div>
		)
	}
}

export default ComboDisplayItem