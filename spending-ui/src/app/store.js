import {configureStore} from '@reduxjs/toolkit'
import tagsReducer from '../features/tagsSlice.js'
import filterReducer from '../filters/filtersSlice.js'

export default configureStore({
    reducer: {
        counter: tagsReducer,
        filters: filterReducer,
    },
})
