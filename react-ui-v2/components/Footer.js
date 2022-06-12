import React from 'react'

class Footer extends React.Component {

	getVersion() {
		this.versionText = "גרסה " + window.Laravel.version;
	}

	render() {
		this.getVersion();
		return (
			<div className="stripFooter">
			  <footer>
			    <div className="container-fluid">
			      <div className="row">
			        <div className="col-sm-2 allRights"> © 2020 כל הזכויות שמורות לש"ס </div>
			        <div className="col-sm-3">{this.versionText}</div>
			        <div className="col-sm-7 clearfix nopadding hidden-xs">
			          <ul className="footerInfo">
			            <li>תמיכה טכנית:</li>
			            <li>support@shas.org.il</li>
			            <li>02-3733211</li>
			          </ul>
			        </div>
			      </div>
			    </div>
			  </footer>
			  <div className="subfooter hidden-xs">
			    <div className="container-fluid">
			      <div className="row">
			        <div className="col-sm-6 col-sm-push-6 contributer"> <a href="http://www.one1.co.il/">
			          <div className="contributerName"><img src={window.Laravel.baseURL + "Images/logo-one.png"} alt="One"/>developed by</div>
			          </a> <a href="http://www.profilesoft.com/he-il/index.asp">
			          <div className="contributerName"><img src={window.Laravel.baseURL + "Images/logo-profile.png"} alt="ProFile"/>UX & UI by</div>
			          </a> </div>
			      </div>
			    </div>
			  </div>
			</div>
		)
	}
}

export default Footer