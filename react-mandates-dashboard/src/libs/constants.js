module.exports = {
  polls: {
    poll_types:{
      conversation: 0, // Multiple messages
      message: 1, // Only single message
    },

    statuses: {
      new: {id: 0, name: 'חדש', image: 'edit'},
      active: {id: 1, name: 'פעיל', image: 'active'},
      pending: {id: 2, name: 'בהמתנה', image: 'pending'},
      completed: {id: 3, name: 'הסתיים', image: 'rejected'},
      archive: {id: 4, name: 'בארכיון', image: 'folder'},
    },

    permissionsTypes:{
      users: 0 ,
      teams: 1 ,
      roles: 2 ,
      headquarters: 3 ,
      geo: 4 ,
    },
    questions:{
      responseTypes: {
        no: 0, 
        yes: 1, 
      }
    }
  },
  geographicEntityTypes: {
    area: 0,
    city: 1,
    neighborhood: 2,
    cluster: 3,
    ballotBox: 4,
    subArea: 5
  },
  permissions: {
    levels: {
        view : 0,
        edit : 1,
    }
},
};
