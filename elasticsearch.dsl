Get /_cat/indices?v
get post 

get post/post/_search
{
  "query":{
    "match_phrase": {
      "postText": ".net console app "
    }
  } 
}


get post/post/_search
{
  "query":{
    "bool": {
      "must": [
        {"match": {
          "postText": ".net console app"
        }}
      ],
      "filter": {
        "range": {
          "postDate": {
            "gte": "2019-01-29T12:00:00-05:00",
            "lte": "2019-01-30"
          }
        }
      }
    }
  } 
}


delete my_net

delete my_blog

PUT /my_blog
{
  "settings": {
    "index": {
      "number_of_shards": "5"
    }
  },
  "mappings": {
    "post": {
      "properties": {
        "user_id": {
          "type": "integer",
          "store": true
        },
        "post_text": {
          "type": "text",
          "analyzer": "standard"
        },
        "post_date": {
          "type": "date",
          "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
        }
      }
    }
  }
}


Get my_blog

Post my_blog/post
{
  "user_id": 1,
  "post_date": "2014-10-23 00:11:22",
  "post_text": "first blog"
  
}
Get my_blog/post/L69RlmgBnnDsZb4Zp2As?stored_fields=user_id


Post my_blog/post
{
  "user_id": 2,
  "post_date": "2018-11-23",
  "post_text": "second blog"
  
}

Post my_blog/post
{
  "user_id": 3,
  "post_date": "22/12/2018",
  "post_text": "second blog wrong time format"
  
}


Post my_blog/post
{
  "user_id": 2,
  "post_date": ["2018-11-23","2018-11-24"],
  "post_text": ["third blog comment 1", "third blog comment 2"] 
  
}


Get my_blog/post/_search?q=post_text:third

Get my_blog/post/_search
{
  "query":{
    "term": {
          "post_date": {
            "gt": "2014-11-01"
          }
    }

  }
}

Get my_blog/post/_search
{
  "query": {
    "filtered": {
      "query": {
        "match": {
          "post_text": "second blog"
        }
      },
      "filter": {
        "range": {
          "post_date": {
            "gt": "2014-11-01"
          }
        }
      }
    }
  }
}

  
}


Post my_blog/post/1
{
  "user_id": 2,
  "post_date": "2018-11-23",
  "post_text": "post with _id 1"
  
}
Get my_blog/post/1?stored_fields=user_id,post_text


PUT my_index/_doc/1
{
  "message": "some arrays in this document...",
  "tags":  [ "elasticsearch", "wow" ], 
  "lists": [ 
    {
      "name": "prog_list",
      "description": "programming list"
    },
    {
      "name": "cool_list",
      "description": "cool stuff list"
    }
  ]
}

GET my_index
GET my_index/_search
{
  "query": {
    "match": {
      "tags": "wow elasticsearch"
    }
  }
}

PUT test/sample/1
{
  "string_type": "some arrays in this document...",
  "int_type": 1,
  "date_type": "2018-1-31",
  "array_type":  [ "elasticsearch", "wow" ], 
  "lists": [ 
    {
      "name": "prog_list",
      "description": "programming list"
    },
    {
      "name": "cool_list",
      "description": "cool stuff list"
    }
  ]
}

get test



