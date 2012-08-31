<?php
if(!isset($_POST["request"])){
    exit(-1);
}

$db = new PDO('sqlite:albums.db');

switch($_POST['request']){
case "gallery_info":
    $result = $db->query('SELECT * FROM gallery_info')->fetch();
    $count= $result["count"];
    $updated= $result["updated"];
    echo "{'count':'$count','updated':'$updated'}";
    break;

case "getHTML":
    $sth = $db->prepare("SELECT * FROM cache WHERE id = :id");
    $sth->execute(array(':id'=>$_POST["id"]));
    $result=$sth->fetch();
    echo $result["html"];
    break;

case "storeHTML":
try
{
    $sth = $db->prepare("INSERT OR REPLACE INTO cache (id,html) VALUES (:id,:html)");
    $sth -> bindParam(':id',$_POST['id']);
    $sth -> bindParam(':html',$_POST['content']);
    $sth->execute();
}
catch(PDOException $e)
{
    print 'Exception : '.$e->getMessage();
}
    break;

case "JSON":
    $sth = $db->prepare("SELECT * FROM cache WHERE slug = :slug");
    $sth->execute(array(':slug'=>$_POST["slug"]));
    $result=$sth->fetch();
    echo json_encode($result);
    break;
}

$db = NULL;
?>
