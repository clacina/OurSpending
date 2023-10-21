import {
    createSlice,
    createSelector,
    createAsyncThunk,
    createEntityAdapter,
    combineReducers,
} from '@reduxjs/toolkit'
// import { client } from '../../api/client'
import { StatusFilters } from '../filters/filtersSlice'

const tagsAdapter = createEntityAdapter()

const initialState = tagsAdapter.getInitialState({
    status: 'idle',
})

// Thunk functions
export const fetchTags = createAsyncThunk('tags/fetchTags', async () => {
    const url = 'http://localhost:8000/resources/tags'
    const data = await fetch(url, { method: 'GET' })
    const str = await data.json();
    return str
})

export const saveNewTag = createAsyncThunk(
    'tags/saveNewTag',
    async (text) => {
        const initialTag = { text }
        // const response = await client.post('/fakeApi/tags', { tag: initialTag })
        // return response.tag
        return initialTag
    }
)

export const tagsSlice = createSlice({
    name: 'tags',
    initialState,
    reducers: {
        tagToggled(state, action) {
            const tagId = action.payload
            const tag = state.entities[tagId]
            tag.completed = !tag.completed
        },
        tagColorSelected: {
            reducer(state, action) {
                const { color, tagId } = action.payload
                state.entities[tagId].color = color
            },
            prepare(tagId, color) {
                return {
                    payload: { tagId, color },
                }
            },
        },
        tagDeleted: tagsAdapter.removeOne,
        allTagsCompleted(state, action) {
            Object.values(state.entities).forEach((tag) => {
                tag.completed = true
            })
        },
        completedTagsCleared(state, action) {
            const completedIds = Object.values(state.entities)
                .filter((tag) => tag.completed)
                .map((tag) => tag.id)
            tagsAdapter.removeMany(state, completedIds)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchTags.fulfilled, (state, action) => {
                tagsAdapter.setAll(state, action.payload)
                state.status = 'idle'
            })
            .addCase(saveNewTag.fulfilled, tagsAdapter.addOne)
    },
})

export const {
    allTagsCompleted,
    completedTagsCleared,
    tagAdded,
    tagColorSelected,
    tagDeleted,
    tagToggled,
} = tagsSlice.actions

export default tagsSlice.reducer

export const {
    selectAll: selectTags,
    selectById: selectTagById,
} = tagsAdapter.getSelectors((state) => state.tags)

export const selectTagIds = createSelector(
    // First, pass one or more "input selector" functions:
    selectTags,
    // Then, an "output selector" that receives all the input results as arguments
    // and returns a final result value
    (tags) => tags.map((tag) => tag.id)
)

export const selectFilteredTags = createSelector(
    // First input selector: all tags
    selectTags,
    // Second input selector: all filter values
    (state) => state.filters,
    // Output selector: receives both values
    (tags, filters) => {
        const { status, colors } = filters
        const showAllCompletions = status === StatusFilters.All
        if (showAllCompletions && colors.length === 0) {
            return tags
        }

        const completedStatus = status === StatusFilters.Completed
        // Return either active or completed tags based on filter
        return tags.filter((tag) => {
            const statusMatches =
                showAllCompletions || tag.completed === completedStatus
            const colorMatches = colors.length === 0 || colors.includes(tag.color)
            return statusMatches && colorMatches
        })
    }
)

export const selectFilteredTagIds = createSelector(
    // Pass our other memoized selector as an input
    selectFilteredTags,
    // And derive data in the output selector
    (filteredTags) => filteredTags.map((tag) => tag.id)
)
