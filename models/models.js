const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "DEFAULT"
    }
});

const Category = sequelize.define('category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    introtext: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    geo: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    categoryTitle: {
        type: DataTypes.STRING,
        references: {
            model: Category,
            key: 'title'
        },
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
        allowNull: false
    }
}, {
    hooks: {
        afterCreate: async (product, options) => {
            const category = await Category.findOne({
                where: { title: product.categoryTitle }
            });
            if (category) {
                category.total += 1;
                await category.save();
            }
        },
        afterDestroy: async (product, options) => {
            const category = await Category.findOne({
                where: { title: product.categoryTitle }
            });
            if (category) {
                category.total -= 1;
                await category.save();
            }
        }
    }
});

const Image = sequelize.define('image', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['id', 'productId'] // добавьте уникальный индекс для пар (id, productId)
        }
    ]
});

const AttributeCategory = sequelize.define('attribute-category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categoryTitle: {
        type: DataTypes.STRING,
        references: {
            model: Category,
            key: 'title'
        },
        allowNull: false
    }
});

const Attribute = sequelize.define('attribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    attributeCategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: AttributeCategory,
            key: 'id'
        },
        allowNull: false
    }
});

const ProductAttribute = sequelize.define('product-attribute', {
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    },
    attributeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Attribute,
            key: 'id'
        },
        allowNull: false
    },
    value: {
        type: DataTypes.STRING, // Тип может изменяться в зависимости от типа атрибута
        allowNull: false
    }
});

const Favourite = sequelize.define('favourite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    }
})

Image.addHook('beforeCreate', async (image, options) => {
    const maxId = await Image.max('id', { where: { productId: image.productId } });
    image.id = maxId !== null ? maxId + 1 : 1;
});

User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

Product.hasMany(Image, { foreignKey: 'productId' });
Image.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id' });

Category.hasMany(Product, { foreignKey: 'categoryTitle' });
Product.belongsTo(Category, { foreignKey: 'categoryTitle', targetKey: 'title' });

Category.hasMany(AttributeCategory, { foreignKey: 'categoryTitle' })
AttributeCategory.belongsTo(Category, { foreignKey: 'categoryTitle' })

AttributeCategory.hasMany(Attribute, { foreignKey: 'attributeCategoryId' });
Attribute.belongsTo(AttributeCategory, { foreignKey: 'attributeCategoryId' });

Product.hasMany(ProductAttribute, { foreignKey: 'productId' });
ProductAttribute.belongsTo(Product, { foreignKey: 'productId' });

Attribute.hasMany(ProductAttribute, { foreignKey: 'attributeId' });
ProductAttribute.belongsTo(Attribute, { foreignKey: 'attributeId' });


// Пользователь может иметь множество избранных записей
User.hasMany(Favourite, { foreignKey: 'userId' });
Favourite.belongsTo(User, { foreignKey: 'userId' });

// Одна запись в избранных относится к одному продукту
Favourite.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Favourite, { foreignKey: 'productId' });


module.exports = {
    User,
    Category,
    Product,
    ProductAttribute,
    Attribute,
    AttributeCategory,
    Image,
    Favourite
};