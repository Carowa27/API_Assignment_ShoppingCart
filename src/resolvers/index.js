const { GraphQLError } = require("graphql");
const fsPromises = require("fs/promises");
const path = require("path");
const crypto = require("node:crypto");

const { checkingExistence, readJSON } = require("../lib/fileHandling");

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
      // const productObject = JSON.parse(productData);
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
      //   const shoppingCartObject = JSON.parse(shoppingCartData);
      return shoppingCartData;
    },
  },
  Mutation: {
    createProduct: async (_, args) => {
      const newProduct = {
        productId: crypto.randomUUID(),
        productName: args.productName,
        unitPrice: args.unitPrice,
      };

      let productFilePath = path.join(
        productsDirectory,
        `${newProduct.productId}.json`
      );

      let idExists = true;
      while (idExists) {
        const exists = await checkingExistence(productFilePath);

        if (exists) {
          newProduct.productId = crypto.randomUUID();
          productFilePath = path.join(
            productsDirectory,
            `${newProduct.productId}.json`
          );
        }
        idExists = exists;
      }

      await fsPromises.writeFile(productFilePath, JSON.stringify(newProduct));

      return newProduct;
    },
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

    // createShoppingCartItem: async (_, args) => {
    // jag vill skapa ett item utan att spara den i en db? spara direct i shoppingcarten?
    //   const activeShoppingCart = args.shoppingCartId;
    //   const newShoppingCartItem = {
    //     product: args.product,
    //     quantity: args.quantity,
    //   };

    //   activeShoppingCart
    //   let shoppingCartItemFilePath = path.join(
    //     shoppingCartDirectory,
    //     `${newShoppingCartItem.shoppingCartId}.json`
    //   );

    //   let idExists = true;
    //   while (idExists) {
    //     const exists = await checkingExistence(shoppingCartItemFilePath);

    //     if (exists) {
    //       newShoppingCartItem.shoppingCartId = crypto.randomUUID();
    //       shoppingCartItemFilePath = path.join(
    //         shoppingCartDirectory,
    //         `${newShoppingCartItem.shoppingCartId}.json`
    //       );
    //     }
    //     idExists = exists;
    //   }

    //   await fsPromises.writeFile(
    //     shoppingCartItemFilePath,
    //     JSON.stringify(newShoppingCartItem)
    //   );
    //   return newShoppingCartItem;
    // },
    addItemToShoppingCart: async (_, args) => {
      //shoppingCart
      const shoppingCartId = args.input.shoppingCartId;
      const shoppingCartFilePath = path.join(
        shoppingCartDirectory,
        `${shoppingCartId}.json`
      );
      const cartExists = await checkingExistence(shoppingCartFilePath);
      if (!cartExists)
        return new GraphQLError(
          `That id (${args.input.shoppingCartId}) is not assigned to a shopping cart`
        );
      const shoppingCartContent = await readJSON(shoppingCartFilePath);
      const shoppingCartData = JSON.parse(shoppingCartContent);

      //product
      const productId = args.input.productId;
      const productFilePath = path.join(productsDirectory, `${productId}.json`);
      const productExists = await checkingExistence(productFilePath);
      if (!productExists)
        return new GraphQLError(
          `That id (${args.input.productId}) is not assigned to a product`
        );
      const product = await readJSON(productFilePath);
      const productData = JSON.parse(product);

      //changes to cart
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

      //rewrite json file and update
      await fsPromises.writeFile(
        shoppingCartFilePath,
        JSON.stringify(updatedShoppingCart)
      );
      return updatedShoppingCart;
    },
    // updateShoppingCartWithNewItem: (_, args) => {},
    // deleteAItemFromShoppingCart: (_, args) => {},
    // deleteAllItemsFromShoppingCart: (_, args) => {},
  },
};
