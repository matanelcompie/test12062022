import React from 'react'

class Baloon extends React.Component {

	setIcon() {
		switch (this.props.type) {
			case "loading":
				this.iconClass = "fa fa-refresh fa-spin fa-fw";
				this.backgroundColor = "btn-info";
				break;
			case "success":
				this.iconClass = "fa fa-check fa-fw";
				this.backgroundColor = "btn-success";
				break;
			case "error":
				this.iconClass = "fa fa-exclamation-triangle fa-fw";
				this.backgroundColor = "btn-danger";
				break;
			default:
				this.iconClass = "fa fa-check fa-fw";
				this.backgroundColor = "btn-primary";
				break;
		}
	}

	componentWillReceiveProps(nextProps) {
		if ((!this.props.show)&&(nextProps.show)&&(this.props.timeout != undefined)) {
			var _this = this;
			setTimeout(function(){
				_this.props.timeoutAction();
			}, this.props.timeout);
		}
	}

	setDisplay() {
		if (!this.props.show) {
			this.style = {
				display: "none"
			}
		} else {
			this.style = {};
		}
	}
	render() {
		this.setIcon();
		this.setDisplay();
		return (
			<div className={"baloon " + this.backgroundColor} style={this.style} onClick={this.props.onClick}>
				<span>
					<i className={this.iconClass}></i>
				</span>
				<span>
					{this.props.text}
				</span>
			</div>
		)
	}
}

export default Baloon