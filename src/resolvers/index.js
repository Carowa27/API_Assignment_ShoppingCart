const { GraphQLError } = require("graphql");
const fsPromises = require("fs/promises");
const path = require("path");
const crypto = require("node:crypto");

const {
  checkingExistence,
  readJSON,
  deleteCart,
} = require("../lib/fileHandling");

const shoppingCartDirectory = path.join(__dirname, "../data/shopping-carts");
const productsDirectory = path.join(__dirname, "../data/products");

exports.resolvers = {
  Query: {
    getProductById: async (_, args) => {
      const productId = args.productId;

      const productFilePath = path.join(productsDirectory, `${productId}.json`);

      const productExists = await checkingExistence(productFilePath);

      if (!productExists)
        return new GraphQLError("That id is not assigned to a product");

      const productData = await readJSON(productFilePath);

      return productData;
    },
    getShoppingCartById: async (_, args) => {
      const shoppingCartId = args.shoppingCartId;

      const shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${shoppingCartId}.json`
      );

      const cartExists = await checkingExistence(shoppingCartFilePath);

      if (!cartExists)
        return new GraphQLError("That id is not assigned to a shopping cart");

      const shoppingCartData = await readJSON(shoppingCartFilePath);

      return shoppingCartData;
    },
  },
  Mutation: {
    createShoppingCart: async (_, args) => {
      const newShoppingCart = {
        shoppingCartId: crypto.randomUUID(),
        shoppingCartItems: [],
        totalPrice: 0,
      };

      let shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${newShoppingCart.shoppingCartId}.json`
      );

      let idExists = true;
      while (idExists) {
        const exists = await checkingExistence(shoppingCartFilePath);

        if (exists) {
          newShoppingCart.shoppingCartId = crypto.randomUUID();
          shoppingCartFilePath = path.join(
            shoppingCartDirectory,
            `${newShoppingCart.shoppingCartId}.json`
          );
        }
        idExists = exists;
      }

      await fsPromises.writeFile(
        shoppingCartFilePath,
        JSON.stringify(newShoppingCart)
      );
      return newShoppingCart;
    },
    addItemToShoppingCart: async (_, args) => {
      const shoppingCartId = args.input.shoppingCartId;

      const shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${shoppingCartId}.json`
      );

      const cartExists = await checkingExistence(shoppingCartFilePath);

      if (!cartExists)
        return new GraphQLError(
          `That id (${shoppingCartId}) is not assigned to a shopping cart`
        );

      const shoppingCartData = await readJSON(shoppingCartFilePath);

      const productId = args.input.productId;

      const productFilePath = path.join(productsDirectory, `${productId}.json`);

      const productExists = await checkingExistence(productFilePath);

      if (!productExists)
        return new GraphQLError(
          `That id (${productId}) is not assigned to a product`
        );

      const productData = await readJSON(productFilePath);

      let productUnitPrice = productData.unitPrice;

      let shoppingCartItems = shoppingCartData.shoppingCartItems;

      let productInShoppingCart = false;

      for (let i of shoppingCartData.shoppingCartItems) {
        if (i.productId === productId) {
          i.quantity++;
          productInShoppingCart = true;
        }
      }
      if (!productInShoppingCart) {
        if (!productExists)
          return new GraphQLError("That product does not exist");

        const addedItem = {
          productId: productId,
          productName: productData.productName,
          unitPrice: productUnitPrice,
          quantity: 1,
        };
        shoppingCartItems.push(addedItem);
      }

      const totalPrice = shoppingCartData.totalPrice;

      let newTotalPrice = totalPrice + productUnitPrice;

      let updatedShoppingCart = {
        shoppingCartId: shoppingCartId,
        shoppingCartItems: shoppingCartItems,
        totalPrice: newTotalPrice,
      };

      await fsPromises.writeFile(
        shoppingCartFilePath,
        JSON.stringify(updatedShoppingCart)
      );

      return updatedShoppingCart;
    },
    removeItemFromShoppingCart: async (_, args) => {
      const shoppingCartId = args.input.shoppingCartId;

      const shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${shoppingCartId}.json`
      );

      const cartExists = await checkingExistence(shoppingCartFilePath);

      if (!cartExists)
        return new GraphQLError(
          `That id (${shoppingCartId}) is not assigned to a shopping cart`
        );

      const shoppingCartData = await readJSON(shoppingCartFilePath);

      const productId = args.input.productId;

      const productFilePath = path.join(productsDirectory, `${productId}.json`);

      const productExists = await checkingExistence(productFilePath);

      if (!productExists)
        return new GraphQLError(
          `That id (${productId}) is not assigned to a product`
        );

      const productData = await readJSON(productFilePath);

      let productUnitPrice = productData.unitPrice;

      let shoppingCartItems = shoppingCartData.shoppingCartItems;

      let productInShoppingCart = false;

      for (let i = 0; i < shoppingCartItems.length; i++) {
        if (shoppingCartItems[i].productId === productId) {
          shoppingCartItems[i].quantity--;
          if (shoppingCartItems[i].quantity === 0) {
            shoppingCartItems.splice(i, 1);
          }
          productInShoppingCart = true;
        }
      }
      if (!productInShoppingCart) {
        if (!productExists)
          return new GraphQLError("That product does not exist");
      }

      const totalPrice = shoppingCartData.totalPrice;

      let newTotalPrice = totalPrice - productUnitPrice;

      let updatedShoppingCart = {
        shoppingCartId: shoppingCartId,
        shoppingCartItems: shoppingCartItems,
        totalPrice: newTotalPrice,
      };

      await fsPromises.writeFile(
        shoppingCartFilePath,
        JSON.stringify(updatedShoppingCart)
      );

      return updatedShoppingCart;
    },
    deleteShoppingCart: async (_, args) => {
      const shoppingCartId = args.shoppingCartId;

      const shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${shoppingCartId}.json`
      );

      const cartExists = await checkingExistence(shoppingCartFilePath);

      if (!cartExists)
        return new GraphQLError(
          `That id (${shoppingCartId}) is not assigned to a shopping cart`
        );

      try {
        await deleteCart(shoppingCartFilePath);
      } catch (error) {
        return {
          deletedId: shoppingCartId,
          success: false,
        };
      }

      return {
        deletedId: shoppingCartId,
        success: true,
      };
    },
  },
};
