%%% Parameter initialization %%%

format long g % Defines the length of the data type

N = input('N = '); % Number of keys
D = input('D = '); % Key length
S = input('S = '); % Session number

DNI = 14569990; % Example ••••••••••••••••••••••••••••••••• parameter
SID = DNI+(S-1);
dni = SID/10^6;
if dni > 23,
  dni = dni/pi;
end
x = (sqrt(5)-2)*dni; % •••••••••••••••••••••••••••••••••••• r (in the figure)
K2 = [];
k2 = [];
Mk2 = [];

for n = 1:N
  x = x-floor(x);
  acuy = 0;
  acuk = 0;
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
  x = x*(pi-127/300); % Setting
end

%%% Showing the keys %%%
Mk2 = Mk2;

%%% Showing the randomness of the keys %%%
plot(1:1:N,K2,'k.')
axis([ 1 N min(K2) max(K2) ])