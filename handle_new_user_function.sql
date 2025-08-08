-- Función para manejar la creación de nuevos usuarios desde auth.users
create or replace function public.handle_new_user() 
returns trigger as $$ 
begin 
  -- Verificar si existe un registro en user_roles_control para asignar un rol específico
  declare
    user_role text;
  begin
    -- Intentar obtener un rol preasignado desde user_roles_control
    select role into user_role from public.user_roles_control 
    where email = new.email;
    
    -- Si no se encuentra un rol preasignado, usar 'free' como valor predeterminado
    if user_role is null then
      user_role := 'free';
    end if;
    
    -- Insertar el nuevo usuario en la tabla users con los datos de Google Auth
    insert into public.users (id, email, name, role, created_at) 
    values (
      new.id, 
      new.email, 
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
      user_role,
      now()
    ); 
  end;
  
  return new; 
end; 
$$ language plpgsql security definer; 

-- Trigger que se ejecuta después de insertar un nuevo usuario en auth.users
create or replace trigger on_auth_user_created 
after insert on auth.users 
for each row execute procedure public.handle_new_user();