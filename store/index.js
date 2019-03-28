import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      projectId: '',
      milestoneId: '',
      chartId: '',
      projectName: '',
      milestoneName: '',
      chartName: '',
      issueCount: ''

    }),
    mutations: {
      projectId(state, id) {
        state.projectId = id;
      },
      milestoneId(state, id) {
        state.milestoneId = id;
      },
      chartId(state, id) {
        state.chartId = id;
      },
      projectName(state, name) {
        state.projectName = name;
      },
      milestoneName(state, name) {
        state.milestoneName = name;
      },
      chartName(state, name) {
        state.chartName = name;
      },
      issueCount(state, cnt) {
        state.issueCount = cnt;
      }
    }
  })
};

export default createStore
