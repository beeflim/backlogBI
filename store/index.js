import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      projectId: '',
      milestoneId: '',
      chartId: '',
      projectName: '',
      milestoneName: '',
      chartName: ''

    }),
    mutations: {
      projectId(state, id){
        state.projectId = id;
      },
      milestoneId(state, id){
        state.miprojectId = id;
      },
      chartId(state, id){
        state.chartId= id;
      },
      projectName(state, id){
        state.projectName = id;
      },
      milestoneName(state, id){
        state.miprojectName = id;
      },
      chartName(state, id){
        state.chartName= id;
      }
    }
  })
}

export default createStore
