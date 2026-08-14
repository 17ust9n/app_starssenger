%%% Parameter initialization %%%

format long g      % Define la longitud del tipo de datos
S = input('S = '); % Número de sesión ••••••••••••••••••••••••••••• 2
D = input('D = '); % Número de decimales considerados ••••••••••••• 8 o 10

brz = round(rand(S,1));
acu = 0;
for s = 1:S
  acu = acu + brz(s);
end
y = acu/S;
x = 3.444+y/10^4;

K2 = [];
k2 = [];
Mk2 = [];
n = 0;
k = 1;
while k == 1,
  x = x - floor(x);  
  acuy = 0;
  acuk = 0;
  n = n+1;
  for c = 1:D
    y = floor(x*10^c)-acuy*10;
    acuy = acuy+y;
    if rem(y,2) == 0,
      k2(c) = 0;
    else
      k2(c) = 1;
    end
    acuk = acuk + k2(c)*2^(c-1);
  end
  Mk2(n,:) = k2;      % Matriz de claves en estado binario
  K2(n) = acuk;       % Vector de claves donde c/u se expresa como un número entero
  k2 = k2;
  k = input('If you want to get a new key enter 1, otherwise enter 0 = ');
  x = x*(pi-127/300); % Setting
end

%%% Showing the keys %%%

Mk2 = Mk2;
%%% Showing the randomness of the keys %%%

plot(1:1:n,K2,'k.')
axis([ 1 n min(K2) max(K2) ])

%%% Calculating the number of different symbols %%%
[Pv, Lv] = dife(K2)