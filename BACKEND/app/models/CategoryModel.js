import {Schema,model} from 'mongoose'
const CategorySchema = new Schema({
    name:String
},{timestamps:true})
const CategoryModel = model('Category',CategorySchema)
export default CategoryModel