import { Request, Response } from 'express';
import * as service from './product_item.service';

export const create = async (req:Request, res:Response) => {
  const item = await service.createProductItem(req.body);
  res.status(201).json(item);
};

export const list = async (_req:Request, res:Response) => {
  const items = await service.getAllProductItems();
  res.json(items);
};

export const getOne = async (req:Request, res:Response) => {
  const item = await service.getProductItemById(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
};

export const update = async (req:Request, res:Response) => {
  await service.updateProductItem(Number(req.params.id), req.body);
  res.json({ message: 'updated' });
};

export const remove = async (req:Request, res:Response) => {
  await service.deleteProductItem(Number(req.params.id));
  res.json({ message: 'deleted' });
};


//export const search = async (req:Request, res:Response) => {
  //const { query } = req.query;
  //const results = await service.searchProductItems(query);
 // res.json(results);
//};
//export const filter = async (req:Request, res:Response) => {
  //const filters = req.body;
  //const results = await service.filterProductItems(filters);
  //res.json(results);
//}