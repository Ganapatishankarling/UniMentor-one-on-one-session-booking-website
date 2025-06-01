import {validationResult} from 'express-validator'
import Category from '../models/CategoryModel.js'

const categoryController = {}

categoryController.list = async(req,res)=>{
        const categories = await Category.find()
        res.json(categories)
}
categoryController.create=async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors:errors.array()})
    }
    const body = req.body
    try{
        const category = await Category.create(body)
        res.json(category)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'something went wrong'})
    }
}
categoryController.getCategory=async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors:'something went wrong'})
    }
    const id = req.params.id
    try{
        const category = await Category.findById(id)
        if(!category){
            return res.status(400).json({error:'category not found'})
        }
        res.json({category})
    }catch(err){
        console.log(err)
        res.status(500).json({error:'something went wrong'})
    }
}
categoryController.delete=async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors:'something went wrong'})
    }
    const id = req.params.id
    try{
        const category = await Category.findByIdAndDelete(id)
        if(!category){
            return res.status(400).json ({error:'category not found'})
        }
        res.json({category})
    }catch(err){
        console.log(err)
        res.status(500).json({error:'something went wrong'})
    }
}

categoryController.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    const id = req.params.id;
    const body = req.body;
    try {
        const category = await Category.findByIdAndUpdate(id, body, { new: true });
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export default categoryController;