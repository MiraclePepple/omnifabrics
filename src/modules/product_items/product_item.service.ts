import { ProductItem } from './product_item.model';

export const createProductItem = async (data:any) => {
  return ProductItem.create({ ...data });
};

export const getAllProductItems = async () => ProductItem.findAll();

export const getProductItemById = async (id:number) => ProductItem.findByPk(id);

export const updateProductItem = async (id:number, data:any) => ProductItem.update(data, { where: { product_item_id: id } });

export const deleteProductItem = async (id:number) => ProductItem.destroy({ where: { product_item_id: id } });
