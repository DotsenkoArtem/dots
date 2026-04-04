<?php
//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'Exception.php';
require 'PHPMailer.php';
require 'SMTP.php';

//Load Composer's autoloader
// require 'vendor/autoload.php';

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);


$name       = $_POST['userName'];
$phone      = $_POST['userPhone'];
$email      = $_POST['userEmail'];
$message    = $_POST['userMsg'];
$myuploads  = $_FILES['file'];

try {
    //Server settings
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER;                       //Enable verbose debug output
    $mail->Debugoutput = function($str, $level) {$GLOBALS['status'][] = $str;};
    // $mail->isSMTP();                                             //Send using SMTP
    $mail->CharSet = 'UTF-8';
    $mail->SMTPAuth   = true;                                       //Enable SMTP authentication

    $mail->Host       = 'smtp.yandex.ru';                             //Set the SMTP server to send through
    //$mail->Username   = 'foka-doka78@yandex.ru';                       //SMTP username
    //$mail->Password   = 'vqjyfymhizkujhml';                             //SMTP password

    // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;             //Enable implicit TLS encryption

    $mail->SMTPSecure = 'ssl';                                      //Enable implicit TLS encryption
    $mail->Port       = 465;                                        //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
    


    //Recipients
    $mail->setFrom('sender@email.ru', 'Администратор');
    $mail->addAddress('doclko31@gmail.com');                        //Add a recipient

    // $mail->addAddress('ellen@example.com');                      //Name is optional
    // $mail->addReplyTo('info@example.com', 'Information');
    // $mail->addCC('cc@example.com');
    // $mail->addBCC('bcc@example.com');

    //Attachments
    // $mail->addAttachment('/var/tmp/file.tar.gz');                //Add attachments
    // $mail->addAttachment('/tmp/image.jpg', 'new.jpg');           //Optional name

    $attachmentSize = 0;
    // Прикрепление файлов
    if (!empty($myuploads['name'][0])) {
        for ($ct = 0; $ct < count($myuploads['tmp_name']); $ct++) {
            $uploadfile = tempnam(sys_get_temp_dir(), sha1($myuploads['name'][$ct]));
            $filename = $myuploads['name'][$ct];
            $attachmentSize += $myuploads['size'][$ct];

            if (move_uploaded_file($myuploads['tmp_name'][$ct], $uploadfile)) {
                $mail->addAttachment($uploadfile, $filename);
                $rfile[] = "Файл $filename прикреплён";
            } else {
                $rfile[] = "Не удалось прикрепить файл $filename";
            }
        }   
    }
    //  - - - - - - - - - - - - 


    //Content
    $mail->isHTML(true);                                            //Set email format to HTML
    $mail->Subject = 'Заявка с сайта "fokadoka.ru"';
    $mail->Body    =    
                    "<b>Пользователь: </b>{$name}<br>
                    <b>Телефон: </b>{$phone}<br>
                    <b>Электронная почта: </b>".$email."<br>
                    <b>Сообщение: </b><br>"
                    .$message;
    $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';





    // if ($mail->send()) {$result = "success";}       //Дефолтная отправка писем
    // else {$result = "error";}




   
    if ($attachmentSize > 10485760) {                  //Отправка с ограничением по суммарному размеру вложений
        $result = "limitExceeded";
    } else {
        $mail->isSMTP();
        if ($mail->send()) {
            $result = "success"; 
        } else {
            $result = "error";
        }
    }

} catch (Exception $e) {
    $result = "error";
    $status = "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
}

// Отображение результата
echo json_encode(["result" => $result, "resultfile" => $rfile, "status" => $status, "myuploads['size']" => $myuploads['size'], "attachmentSize" => $attachmentSize]);
