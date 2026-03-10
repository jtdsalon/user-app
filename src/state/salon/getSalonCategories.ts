import { call, put } from 'redux-saga/effects'
import * as TYPES from './types'
import { getSalonCategoriesApi } from '../../services/api/salonService'
import { HTTP_CODE } from '../../lib/enums/httpData'

// Action creators
export const getSalonCategories = () => ({
  type: TYPES.GET_SALON_CATEGORIES,
})

const getSalonCategoriesSuccess = (payload: string[]) => ({ 
  type: TYPES.GET_SALON_CATEGORIES_SUCCESS, 
  payload 
})

const getSalonCategoriesError = (payload: any) => ({ 
  type: TYPES.GET_SALON_CATEGORIES_ERROR, 
  payload 
})

// Saga
export function* getSalonCategoriesSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(getSalonCategoriesApi)
    if (response.status === HTTP_CODE.OK || response.status === HTTP_CODE.CREATED) {
      // Normalize various backend response shapes:
      // 1) direct array: ['A','B']
      // 2) { categories: [...] }
      // 3) { data: [...] }
      // 4) { data: { categories: [...] } }
      const body = response.data || {}
      let categories: string[] = []
      
      if (Array.isArray(body)) {
        categories = body
      } else if (Array.isArray(body?.categories)) {
        categories = body.categories
      } else if (Array.isArray(body?.data)) {
        categories = body.data
      } else if (Array.isArray(body?.data?.categories)) {
        categories = body.data.categories
      }

      // Filter out null/empty values and add 'All' at the beginning
      const filtered = categories
        .filter((cat: string) => cat && String(cat).trim() !== '')
        .filter((cat: string, idx: number, arr: string[]) => arr.indexOf(cat) === idx) // Remove duplicates

      const finalCategories = ['All', ...filtered]
      yield put(getSalonCategoriesSuccess(finalCategories))
    } else {
      yield put(getSalonCategoriesError(response))
    }
  } catch (err) {
    yield put(getSalonCategoriesError(err))
  }
}
