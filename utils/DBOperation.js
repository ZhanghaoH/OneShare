var Bmob = require('./bmob.js');
//数据库的增加操作
function add(DBName, data) {
  return new Promise((resolve, reject) => {
    var DB = Bmob.Object.extend(DBName);
    console.log(DBName);
    var db = new DB();
    console.log(data);
    for (let key in data) {
      db.set(key, data[key]);
    }
    //添加数据，第一个入口参数是null
    db.save(null, {
      success: function (result) {
        // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
        console.log("数据添加成功, objectId:" + result.id);
        resolve(result.id);
      },
      error: function (result, error) {
        // 添加失败
        console.log('数据添加失败');
        console.log(error);
        reject();
      }
    });
  });
}
//修改数据
function change(DBName, id, data) {
  return new Promise((resolve, reject) => {
    var DB = DBName == "_User" ? Bmob.User.extend("_User") : Bmob.Object.extend(DBName);
    var query = new Bmob.Query(DB);
    var db = new DB();
    console.log(DBName);
    console.log(id);
    // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
    query.get(id, {
      success: function (result) {
        // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了
        for (let key in data) {
          result.set(key, data[key]);
        }
        result.save();
        // console.log(result.attributes)
        console.log(result)
        resolve(result.attributes);
      },
      error: function (object, error) {
        console.log(error);
        reject();
      }
    });
  });
}
//修改用户表数据
function changeUser(id, data) {
  return new Promise((resolve, reject) => {
    var currentUser = Bmob.User.current();
    for (let key in data) {
      currentUser.set(key, data[key]);
    }
    currentUser.save(null, {
      success: function (result) {
        resolve();
      },
      error: function (result,error) {
        console.log(error)
        reject(error);
      }
    });
  });
}
// 条件查询
function getBy(DBName, key, value, orderKey) {
  return new Promise((resolve, reject) => {
    var DB = Bmob.Object.extend(DBName);
    var query = new Bmob.Query(DB);
    query.limit(1000);
    if (orderKey) {
      query.descending(orderKey); //降序排列
    }
    if (key) {
      query.equalTo(key, value);
    }
    // 查询(符合条件的)所有数据
    query.find({
      success: function (results) {
        console.log(results)
        resolve(results);
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
        reject();
      }
    });
  });
}
//查询单条数据
function getById(DBName, objectId) {
  return new Promise((resolve, reject) => {
    var DB = Bmob.Object.extend(DBName);
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(DB);
    //查询单条数据，第一个参数是这条数据的objectId值
    query.get(objectId, {
      success: function (result) {
        // 查询成功，调用get方法获取对应属性的值
        console.log(result);
        resolve(result);
      },
      error: function (object, error) {
        // 查询失败
        console.log(error);
        reject();
      }
    });
  });
}
//查询用户信息
function getUser(userId) {
  return new Promise((resolve, reject) => {
    var query = new Bmob.Query(Bmob.User.extend('_User'));
    query.equalTo("objectId", userId);
    console.log(userId);
    query.first({
      success: function (result) {
        // 循环处理查询到的数据
        if (result) {
          console.log(result);
          resolve(result.attributes);
        }
        // 结果信息包含在attribute中
        // userName: resData.username,
        // phoneNum: resData.mobilePhoneNumber,
        // email: resData.email,
        // area: resData.area,
        // university: resData.university,
        // major: resData.major,
        // degree: resData.title,
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
        reject();
      }
    })
  });
}
module.exports.getUser = getUser;
module.exports.getById = getById;
module.exports.getBy = getBy;
module.exports.add = add;
module.exports.change = change;
module.exports.changeUser = changeUser;