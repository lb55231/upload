import { axios } from 'axios'

const base = 'http://192.168.3.101:8020/'

export const update = params => { return axios.get(`${base}wf/wf01/wf0101/getprocnodeoptbyproc`, { params: params }).then(res => res.data) }