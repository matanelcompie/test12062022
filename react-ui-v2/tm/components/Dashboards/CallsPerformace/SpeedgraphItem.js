import React, { Component } from 'react';
import Gauge from 'components/global/D3/Gague/Gauge';

const SpeedgraphItem = ({arcColor , regularFontStyle , bigFontStyle , headerText , numericValue , getCurrentArcArray , relativeTo ,   avgRelativeTo=null }) => {
		//console.log(numericValue + "-" + avgRelativeTo + " - "+relativeTo);
		return (<div>
					<div className="row">
						<div className="col-md-12">
							<Gauge value={(numericValue <= relativeTo ?  (numericValue/relativeTo) : 1)}
								size={20}
								radius={67}
								height = {69}
								sections={getCurrentArcArray((numericValue/(avgRelativeTo ? avgRelativeTo : relativeTo)) , arcColor)}
								arrow={{height: 60, width: 2, color: "#000"}}
								legend={[]}
								label="15%"
							/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12" style={{textAlign:'center' , marginTop:'2px'}}>
							<span style={regularFontStyle}>{headerText}</span>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12" style={{textAlign:'center' }}>
							<span style={bigFontStyle}>{numericValue}</span>
						</div>
					</div>
				</div>
                )
}
export default SpeedgraphItem ;