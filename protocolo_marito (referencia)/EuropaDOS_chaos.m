function [k,y] = chaos(y,D)

x = 0.444666+y/10^7;
r = 3.611+y/10^4;
k = [];

x = r*x*(1-x);
x = x-floor(x);
acuy = 0;
acuk = 0;
for d = 1:D
  y = floor(x*10^d)-acuy*10;
  acuy = acuy+y;
  if rem(y,2) == 0,
    auxk(d) = 0;
  else
    auxk(d) = 1;
  end
  acuk = acuk + auxk(d)*2^(d-1);
end
k = auxk;

y = b2d(k,D);