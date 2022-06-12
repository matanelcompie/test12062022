import React from 'react';
import PropTypes from 'prop-types';

const EmployeesTab = ({campaign}) => {
    return (
        <div className="campaign-detail-tab-target-group tabContnt containerStrip">
            <div className="row panelTitle">
                <div className="col-xs-12">Employees Tab Content</div>
            </div>
            <div className="row panelContent">
                <div className="col-xs-12">
                    Donec eu hendrerit nisl, sed scelerisque nunc. Mauris non facilisis eros, et facilisis magna. Integer id eros lorem. In id magna ultricies, tincidunt lacus id, feugiat ante. Sed molestie velit eget metus scelerisque, a sodales magna tincidunt. Curabitur vitae placerat elit. Vestibulum feugiat mollis vestibulum. Donec ut luctus ante. Donec non eros vitae eros dictum euismod id non velit. Vivamus suscipit scelerisque enim pellentesque luctus. Aliquam pharetra nunc et leo iaculis porta. Curabitur vitae mi tellus. Vestibulum aliquam vestibulum nisi ac suscipit. Sed augue ante, fringilla sit amet iaculis eget, vulputate id odio. Aenean tristique enim vel lectus commodo aliquet. Donec volutpat lacinia risus, non maximus nisi sollicitudin eleifend.
                </div>
            </div>
            <div className="row panelContent">

            </div>
        </div>
    );
};

EmployeesTab.propTypes = {
    campaign: PropTypes.object,
};

EmployeesTab.defaultProps = {
    campaign: {},
};

export default (EmployeesTab);
