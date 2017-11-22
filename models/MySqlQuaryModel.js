exports.selectQuery = function(sqlConnection, columns, tableName, conditionQuary, values, action, callback)
{
    var columnQuary = makeQuary(columns);
    var sqlQuary;

    if(conditionQuary == null){
        sqlQuary = 'select ' + columnQuary + 
                    ' from ' + tableName;
    }
    else{
        sqlQuary = 'select ' + columnQuary + 
                    ' from ' + tableName + 
                    ' where ' + conditionQuary;
    }
    
    var queryData = sqlConnection.query(sqlQuary, values, (err, rows) => {
        action(err, rows, callback);
    });

    console.log(queryData.sql);
}

exports.insertQuery = function(sqlConnection, tableName, columns, values, action, callback)
{
    var columnQuary = '( ' + makeQuary(columns) + ' )';
    var sqlQuary = 'insert into ' + tableName + columnQuary +
                ' values ?';
                    
    var queryData = sqlConnection.query(sqlQuary, [values], (err, result) => {
        action(err, result, values, callback);
    });

    console.log(queryData.sql);
}

exports.deleteQuery = function(sqlConnection, tableName, conditionQuary, values, action, callback)
{
    var sqlQuary = 'delete from ' + tableName +
                ' where ' + conditionQuary;
                    
    var queryData = sqlConnection.query(sqlQuary, values, (err, result) => {
        action(err, result, callback);
    });

    console.log(queryData.sql);
}

exports.updateQuery = function(sqlConnection, tableName, columns, conditionQuary, values, action, callback)
{
    var columnQuary = makeQuestionQuary(columns);
    var sqlQuary = 'update ' + tableName +
                ' set ' + columnQuary + 
                ' where ' + conditionQuary;
                
    var queryData = sqlConnection.query(sqlQuary, values, (err, result) => {
        action(err, result, callback);
    });

    console.log(queryData.sql);
}





function makeQuestionQuary(arr){
    var result = '';
    for(var i = 0; i < arr.length; i++){
        if(i == arr.length-1){
            result += arr[i] + ' = ?';            
        }
        else{
            result += arr[i] + ' = ? ,';
        }
    }
    return result;
}

function makeQuary(arr){
    var result = '';
    for(var i = 0; i < arr.length; i++){
        if(i == arr.length-1){
            result += arr[i];            
        }
        else{
            result += arr[i] + ', ';
        }
    }
    return result;
}