from werkzeug.security import generate_password_hash

# Coloque a senha que você quer usar para acessar o painel aqui
senha_criptografada = generate_password_hash("xandinhodo244")
print(senha_criptografada)