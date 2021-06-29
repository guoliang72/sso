from pymongo import MongoClient
import json


class Json2Mongo(object):
    def __init__(self):
#        self.host = '59.110.167.103'
        self.host = 'localhost'
        self.port = 27017
        # 创建mongodb客户端
        self.client = MongoClient(self.host, self.port)
        self.client.admin.authenticate("gjm", "CISE:1726")
        print(self.client.database_names());
        # 创建数据库dialog
        self.db = self.client['SSOserver']
        # 创建集合scene
        self.collection = self.db['users']

    # 写入数据库
    def write_database(self):
        with open('users.json', 'r') as f:
            # 转换为dict
            json_data = json.load(f)
#        print(json_data)
        rows = self.collection.find()
        for row in rows:
    	   	print(row)
#        try:
#            myquery = {"name": "dfcg_ivr"}  # 查询条件
#            self.collection.update(myquery, data, upsert=True)  # upsert=True不存在则插入，存在则更新
#            # self.collection.insert(data)
#            print('写入成功')
#        except Exception as e:
#            print(e)
    # 从数据库读取
#    def read_datebase( self ):
#        try:
#            myquery = {"name": "dfcg_ivr"} # 查询条件
#            scene_flow = self.collection.find(myquery)
#            print(type(scene_flow))
#            for x in scene_flow:
#                print(type(x))
#                print(x)
#            print ('读取成功')
#        except Exception as e:
#            print (e)


if __name__ == '__main__':
    jm = Json2Mongo()
    jm.write_database()
#    jm.read_datebase()