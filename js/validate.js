/**
 * Pragma.Libs.Validate
 * Plugin para las validaciones de los formularios.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-validate : define el plugin. Debe ser aplicado sobre el formulario.
 * data-validate-options="[opciones]"     :   Opciones de configuración via HTML.
 * //Reglas de campos
 * data-rule-[nombre_regla]             : Aplica la regla de nombre [nombre_regla] al campo.
 * data-rules="[nombre_regla]:opciones" : Aplica las reglas contenidas al campo.
 * //Atributos especiales:
 * required                             : Valida el campo no esté vacío.
 * minlength=[n]                        : Valida el campo tenga como minimo la longitud [n] definida.
 * maxlenght=[n]                        : Valida el campo tenga como máximo la longitud [n] definida.
 * min                                  : Valida la fecha o el número sea mayor o igual a [n].
 * max                                  : Valida la fecha o el número sea menor o igual a [n].
 * #-----------------
 * Métodos:
 * #-----------------
 * Validate.check([nombre_campo],[silencioso])    : Valida el campo name=[nombre_campo]. Adicionalmente, se puede 
 *                                                  especificar el parámetro [silencioso], que si está en true, 
 *                                                  impedirá se generen errores visuales.  
 *                                                  
 * Validate.check_all([silencioso])               : Valida todos los campos del formulario. Adicionalmente, se puede 
 *                                                  especificar el parámetro [silencioso], que si está en true, 
 *                                                  impedirá se generen errores visuales.
 *                                                  
 * Validate.clean([nombre_campo])                 : Limpia los errores visuales generados en la validación del 
 *                                                  campo con nombre [nombre_campo].
 *                                                  
 * Validate.clean_all()                           : Limpia todos los visuales generados en las validaciones.
 * Validate.open_summary([message])               : Abre el sumario de errores y muestra el texto suministrado.
 *                                                  El sumario sólo abrirá si el mismo fue definido en html.
 *                                                  
 * Validate.close_summary()                       : Cierra el sumario.
 *                                                                                                 
 * Validate.add_rules([reglas])                   : Añade las reglas suministradas a la instancia del plugin. 
 *                                                  El formato de las reglas deberá ser un objeto cuyo indice será el 
 *                                                  nombre de la regla, y su valor, la validación como tal. La validación
 *                                                  puede ser una expresión regular, o, una función. 
 *                                                  
 * Validate.remove_rules([reglas])                : Borra la reglas de la instancia del plugin. 
 *                                                  El formato de las reglas deberá ser una matriz cuyos valores serán 
 *                                                  los nombres de las reglas a eliminar.
 *                                                  
 * Validate.clean_rules()                         : Borra todas las reglas definidas en la instancia del plugin.
 * 
 * Validate.add_fields_rules([campos])            : Agrega a los campos defininos las reglas de validación proporcionadas.
 *                                                  El formato de los campos deberá ser un objeto cuyo indice será el 
 *                                                  nombre del campo, y su valor el nombre de la regla a validar. 
 *                                                  En el caso que se quieran aplicar varias reglas, el valor será otro 
 *                                                  objeto que tendrá por indice el nombre de la regla y de valor una 
 *                                                  matrizcon los parámetros por aplicar a la regla.
 *                                                  
 * Validate.remove_fields_rules([campos])         : Elimina de los campos las reglas proporcionadas. 
 *                                                  El formato de campos deberá ser un objeto cuyo indice será el nombre 
 *                                                  del campo, y su valor el nombre de la regla a eliminar. 
 *                                                  En caso que se desee eliminar varias reglas, el valor será una matriz 
 *                                                  con los nombres de cada regla por eliminar. 
 *                                                  
 * Validate.clean_field_rules([nombre_campo])     : Elimina todas las reglas de validación asociadas al campo con el 
 *                                                  atributo name=[nombre_campo] en la instancia actual.
 *                                                  
 * Validate.clean_fields_rules()                  : Elimina todas las reglas de validación para todos los campos en 
 *                                                  la instancia del plugin.
 *                                                  
 * Validate.add_rules_messages([reglas])          : Agrega a las reglas los mensajes proporcionados. 
 *                                                  El formato de reglas deberá ser un objeto cuyo indice será el nombre 
 *                                                  de la regla, y su valor será el mensaje.

 * Validate.remove_rules_messages([reglas])       : Elimina de la instancia los mensajes personalizados de las reglas 
 *                                                  proporcionadas. El formato de reglas deberá ser una matriz cuyos 
 *                                                  elementos serán los nombres de las reglas.

 * Validate.clean_rules_messages()                : Elimina todos los mensajes personalizados definidos en la 
 *                                                  instancia actual.   
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.validate.before_init   : Lanzado al inicializar el plugin.
 * pragma.validate.after_init    : Lanzado al terminar la configuración inicial del plugin.
 * pragma.validate.success       : Evento lanzado cuando la validación total del formulario ha sido exitosa.
 * pragma.validate.error         : Evento lanzado cuando la validación total del formulario ha dado errores.
 *                               : Adicionalmente, provee la propiedad del evento [evento.errors] 
 *                                 con los nombres de los campos que tuvieron errores.
 * pragma.validate.field.success : Evento lanzado cuando el campo en particular se ha validado exitosamente. 
 *                                 Para escuchar este evento, deberá seleccionarse el campo como tal con la 
 *                                 sintaxis $(campo).on("pragma.validate.field.success",function(e){...}).

 * pragma.validate.field.error   : Evento lanzado cuando el campo en particular tiene errores en la validación. 
 *                                 Para escuchar este evento, deberá seleccionarse el campo como tal con la 
 *                                 sintaxis $(campo).on("pragma.validate.field.error",function(e){...}).
                                   Adicionalmente, provee la propiedad del evento evento.rule el nombre de la 
                                   regla donde se encontró el error.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/form.less
 * less/mixins/form.less
 */
$(function( Pragma, $, undefined ) {
  "use strict";
  Pragma.Libs.Validate = function(element,options){
    var self = this;
    self.options = options;
    self.$el = element;
    self.fields = {}
    self.send = false;
    
    /**
     * Valida el campo suministrado.
     * @param  {string} name   Nombre del campo.
     * @param  {bool} silent   Determina si deberá mostrarse visualmente o no los errores. Por defecto true. 
     * @return {bool}          true si no se encontraron errores en el campo, de lo contrario, false.
     */
    self.check = function(name,silent)
    {
      if(self.fields[name] === undefined)
      {
        return;
      }
      self.clean();
      var status = true;
      var message = "";
      var params = [];

      //Si el campo está vacio, sólo se valida "required"
      if(self.fields[name].$el.val().length == 0)
      {
        if(self.fields[name]["rules"]["required"] !== undefined)
        {
          message = get_rule_message(self.fields[name].$el,"required");
          status = false;
          self.fields[name].$el.trigger(
          {
            type : "pragma.validate.field.error",
            rule : "required"
          });
        }
      }
      //Si el campo se llenó, se verifican las demás validaciones
      else
      {
        $.each(self.fields[name].rules,function(rule,params){
          if(!status)
          {
            return false;
          }
          var validator = "";
          validator = get_rule(rule);

          if(validator === false)
          {
            status = false;
          }
          else if(typeof validator == "function")
          {
            status = validator(self.fields[name].$el,self.$el,params);  
          }
          else
          {
            status = validator.test(self.fields[name].$el.val());
          }
          if(!status)
          {
            self.fields[name].$el.trigger(
            {
              type : "pragma.validate.field.error",
              rule : rule
            });
            message = get_rule_message(self.fields[name].$el,rule,params); 
            return;
          }
        });
      }


      if(status)
      {

        self.fields[name].$el.trigger("pragma.validate.field.success");
        //Sólo se marcará como "success" los campos validados correctos que estén llenos.
        if(silent !== true && self.fields[name].$el.val().length > 0)
        {
          set_style("success",self.fields[name].$el,self.options.success_message);
        }
        self.fields[name].error = "";
        return true;
      }

      self.fields[name].error = message;  
      if(silent !== true)
      {   
        set_style("error",self.fields[name].$el,message);
      }
      return false;
    }


    /**
     * Valida todos los campos del formulario.
     * @param  {bool} silent Determina si deberá mostrarse visualmente o no los errores. Por defecto true. 
     * @return {bool} true si todos los campos son exitosos, de lo contrario, false.
     */
    self.check_all = function(silent)
    {
      var result = true;
      var messages = {};
      var errors = [];
      $.each(self.fields, function(k,field){
        var r = self.check(k,silent);
        if(!r)
        {

          /*Configurando campos para el sumario*/
          var name = field.$el.attr("name");
          errors.push(name);
          if(field.$el.attr("id") !== undefined)
          {
            field.$el.parent(".row").find("label").each(function(){
              if($(this).attr("for") == field.$el.attr("id"))
              {
                name = $(this).text();
              }
            });
          }
          messages[name] = self.fields[k].error;
          //focus sobre el primer error encontrado
          if(result === true){
            $(window).scrollTop(field.$el.offset().top);
            field.$el.focus();
          }
          result = false;
        }
      });
      

      if(silent !== true)
      {

        if(result)
        {
          self.close_summary();
        }
        else
        {
          var content = '<h4>'+self.options.summary_text+'</h4><ul class="unstyled">';
          $.each(messages,function(label,message){
            content+= '<li><b>'+label+' </b>'+message+'</li>';
          });
          self.open_summary(content);
        }
      }

      if(!result)
      {
        self.$el.trigger(
        {
          type : "pragma.validate.error",
          errors : errors
        });

      }else
      {
        self.$el.trigger("pragma.validate.success");
      }

      return result;
    }
    /**
     * Muestra el sumario con el contenido dado.
     * Sólo lo mostrará si el usuario definió el mismo.
     * @param  {string} message Mensaje a mostrar en el sumario.
     */
    self.open_summary = function(message)
    {
      if(self.$summary)
      {
        if(message !== undefined && message !== false)
        {
          self.$summary.html(message);
        }
        
        if(Pragma.Libs.Alert !== undefined)
        {
          self.$summary.pragma("alert","open");
        }

        else
        {
          self.$summary.removeClass("hide");
        }
      }

    }
    /**
     * Cierra el sumario.
     */
    self.close_summary = function()
    {
      if(self.$summary)
      {
        if(Pragma.Libs.Alert !== undefined)
        {
          self.$summary.pragma("alert","close");
        }
        else
        {
          self.$summary.addClass("hide");
        }
      }
    }
    /**
     * Elimina visualmente los errores para el campo.
     * @param  {string} name Nombre del campo.
     */
    self.clean = function(name)
    {
      if(self.fields[name] === undefined)
      {
        return;
      }
      self.fields[name].error = "";
      set_style("clean",self.fields[name].$el);
    }
    /**
     * Elimina visualmentelos errores para todos los campos del formulario.
     */
    self.clean_all = function()
    {
      $.each(self.fields,function(name,field){
        self.clean(name);
      });
    }

    /**
     * Agrega a las reglas los mensajes proporcionados. 
     * @param {[object]} messages El indice será el nombre de la regla y su valor el mensaje.
     */
    self.add_rules_messages = function(messages)
    {
      if(typeof messages == "object" && Pragma.Utils.count_object(messages) > 0)
      {
        $.each(messages, function(rule,message){
          self.options.messages[rule] = message;
        });
      }
    }
    /**
     * Elimina los mensajes a las reglas proporcionadas.
     * @param  {[array]} Matriz con los nombres de las reglas a las cuales se eliminará el mensaje.
     */
    self.remove_rules_messages = function(rules)
    {
      if(typeof rules == "object" && rules.length > 0)
      {
        var new_messages = {}
        $.each(self.options.messages, function(rule,message){
          if($.inArray(rule,rules) < 0){
            new_messages[rule] = message;
          };
        });

        self.options.messages = new_messages;
      }
    }
    /**
     * Elimina todas las reglas personalizadas de la instancia.
     */
    self.clean_rules_messages = function(){
      self.options.rules = {}
    }

    /**
     * Añade las reglas de validación especificadas.
     * @param {[object]} rules El indice será el nombre de la regla, y su valor,la validación como tal. 
     *                         La validación puede ser una expresión regular, o, una función.
     */
    self.add_rules = function(rules){
    	if(typeof rules == "object" && Pragma.Utils.count_object(rules) > 0)
    	{
    		$.each(rules, function(name,definition){
    			self.options.rules[name] = definition;
    		});
    	}
    }
    /**
     * Elimina las reglas de validación especificadas.
     * @param  {[array]} rules Matriz cuyos valores serán los nombres de las reglas a eliminar.
     */
    self.remove_rules = function(rules)
    {
    	if(typeof rules == "object" && rules.length > 0)
    	{
    		var new_rules = {};
    		$.each(self.options.rules, function(name,definition){
    			//Si la regla no está contenida entre las que hay que eliminar
    			//la guardamos en el objeto que contiene las reglas 
    			if($.inArray(name,rules) < 0)
    			{
    				new_rules[name] = definition;
    			}
    		});
    		self.options.rules = new_rules;
    	}
    }
    /**
     * Elimina todas las reglas de validación personalizadas para la instancia.
     */
    self.clean_rules = function()
    {
    	self.options.rules = {};	
    }

    /**
     * Agrega las validaciones suministradas a los campos definidos dados.
     * @param {[object]} fields El indice será el nombre del campo, y su valor el nombre de la regla a validar. 
     *                          En el caso que se quieran aplicar varias reglas, el valor será otro objeto que 
     *                          tendrá por indice el nombre de la regla y de valor una matriz con los parámetros 
     *                          por aplicar a la regla.
     */
    self.add_fields_rules = function(fields)
    {
      if(typeof fields == "object" && Pragma.Utils.count_object(fields) > 0)
      {
        $.each(fields, function (name,rules){
          if(self.fields[name] !== undefined)
          {
            if(typeof rules == "string")
            {
              self.fields[name].rules[rules] = [];
            }
            if(typeof rules == "object" && Pragma.Utils.count_object(rules) > 0)
            {
              $.each(rules,function(rule,params){
                if(typeof rule == "number")
                {
                  self.fields[name].rules[params] = [];
                }
                else if(params === null)
                {
                  self.fields[name].rules[rule] = [];

                }
                else if(typeof params != "object")
                {
                  self.fields[name].rules[rule] = [params];
                }
                else
                {
                  self.fields[name].rules[rule] = params;
                }
              })
            }
            self.fields[name].rules = order_rules(self.fields[name].rules);
          }
        });
      }

    }
    /**
     * Elimina de los campos las reglas proporcionadas.
     * @param  {[object]} fields objeto cuyo indice será el nombre del campo, y su valor el nombre de la 
     *                    regla a eliminar. En caso que se desee eliminar varias reglas, el valor será 
     *                    una matriz con los nombres de cada regla por eliminar. 
     */
    self.remove_fields_rules = function(fields)
    {
      if(typeof fields == "object" && Pragma.Utils.count_object(fields) > 0)
      {
        $.each(fields,function (name,rules)
        {
          if(self.fields[name] !== undefined)
          {
            var new_rules = {};
            if(typeof rules == "string")
            {
              rules =[rules];
            }
            $.each(self.fields[name].rules, function(rule,params){
              if($.inArray(rule,rules) < 0)
              {
                new_rules[rule] = params;
              }
            });
            self.fields[name].rules = order_rules(new_rules);
          }
        });
      }
    }
    /**
     * Elimina todas las reglas de validación asociadas al campo dado.
     * @param  {[string]} name Nombre del campo.
     */
    self.clean_field_rules = function(name)
    {
      if(self.fields[name] !== undefined)
      {
        self.fields[name].rules = {};
      }

    }
    /**
     * Elimina todas las reglas de validación de todos los campos.
     */
    self.clean_fields_rules = function()
    {
      $.each(self.fields, function(name,field){
        self.fields[name].rules = {};
      });
    }


    /**
     * Método privado.
     * Devuelve la regla buscada.
     * Hara una búsqueda en cascada, primero revisando en la instancia actual 
     * [validate.options.rules] y luego en la definición global validate.rules.
     * @param  {string} name Nombre de la regla.
     * @return {string|function|false} Devolverá la expresión regular o la función de la regla en caso
     * de ser conseguida, de lo contrario, false.
     */
    function get_rule(name)
    {
    	if(self.options.rules[name] !== undefined)
    	{
    		return self.options.rules[name];
    	}

    	if(Pragma.Libs.Validate.Rules[name] !== undefined)
    	{
    		return Pragma.Libs.Validate.Rules[name];
    	}
    	return false;
    }


    /**
     * Método privado.
     * Determina si la regla suministrada existe..
     * @param  {string} name nombre de la regla.
     * @return {bool}        true en caso de existir, de lo contrario, false.
     */
    function rule_exists(name){
      if(self.options.rules[name] !== undefined)
      {
        return true;
      }
      if(Pragma.Libs.Validate.Rules[name] !== undefined)
      {
        return true;
      }
      return false;
    }

    /**
     * Establece el estilo al campo y cambia el mensaje de ayuda asociado al campo.
     * @param {string} style   Estilo visual. puede ser success o danger.
     * @param {string} $field  Nombre del campo al que se le aplicará el estilo.
     * @param {string} message Mensaje de ayuda asociado al campo.
     */
    function set_style(style,$field,message)
    {
    	if(message===undefined)
    	{
    		message = "";
    	}
			if(style=="success")
			{
				$field.closest(".row").addClass("success");
			}
			if(style=="error")
			{
				$field.closest(".row").addClass("danger");
			}
			if(style=="clean")
			{
				$field.closest(".row").removeClass("success danger");
			}
			if($field.closest(".row").find(".help").length > 0)
			{
				$field.closest(".row").find(".help").html(message);
			}
    }
    /**
     * Método privado.
     * Devuelve el mensaje de error formateado.
     * @param  {object} $el   Campo.
     * @param  {[type]} name  Nombre de la regla.
     * @param  {[type]} params Parámetros.
     * @return {[type]}
     */
    function get_rule_message($el,name,params)
    {
    	var message = "Error.";
    	var label = "";
    	if(typeof params != "object")
    	{
    		params = [];
    	}
    	if($el.attr("data-msg-"+name) !== undefined)
    	{
    		message = $el.attr("data-msg-"+name);
    	}else if(self.options.messages[name] !== undefined)
    	{
    		message = self.options.messages[name];
    	}else if(Pragma.Libs.Validate.Messages[name] !== undefined)
    	{
    		message = Pragma.Libs.Validate.Messages[name];
    	}
    	if($el.attr("id") !== undefined)
    	{
    		$el.parent(".row").find("label").each(function(){
    			if($(this).attr("for") == $el.attr("id"))
    			{
    				label = $(this).text();
    			}
    		});
    	}
    	//Formato de variables del mensaje
    	$.each(params,function(k,v){
	    	message = message.replace("{"+k+"}",v);
	    });
 			message = message.replace("{rule}",name).replace("{label}",label).replace("{value}", $.parseHTML($el.val()));
	    return message;
    }

    /**
     * Método privado.
     * Da formato a los parámetros.
     * @param  {[type]} params Parámetros.
     * @param  {[type]} chr    Caracter separador.
     * @return {object}        Matriz con los parámetros.
     */
    function format_params(params,chr)
    {
    	var p = [];
    	if(chr === undefined)
    	{
    		chr = ";";
    	}

    	if(typeof params == "string")
    	{
    		params = params.trim().split(chr);
    	}

    	$.each(params,function(k,param){
    		param = param.trim();
    		if(param.length > 0)
    		{
    			p.push(param);
    		}
    	});
    	return p;
    }

    /**
     * Método privado.
     * Organiza las reglas. Se asegura que la validación "required" esté de primera,
     * y posteriormente estén las numéricas, para que se valide correctamente cuando
     * se establece min o max y estas no se validen primero.
     * 
     * @param  {object} Objeto cuyo indice será el nombre de la regla, y su valor, los parámetros
     *                  asociados a la misma.
     **/
    function order_rules(rules)
    {
    	var r = {}
    	if(rules["required"] !== undefined)
    	{
    		r["required"] = rules["required"];
    	}
    	if(rules["integer"] !== undefined)
    	{
    		r["integer"] = rules["integer"];
    	}
    	if(rules["number"] !== undefined)
    	{
    		r["number"] = rules["number"];
    	}
    	$.each(rules,function(name,params){
    		if(r[name] === undefined)
    		{
    			r[name] = params;
    		}
    	});
    	return r;
    }




    /**
     * Método privado.
     * Configura las reglas de validación para los campos.
     */
    function configure_rules()
    {
    	var html5 = ["required","min","max","minlength","maxlength"];
			self.$el.find("input,select,textarea").each(function(id){
				var field = 
				{
					$el   : $(this),
					rules : {},
					error : false
				}
				//Buscando regla="param1,param2,param3";
				$.each(html5,function(k,name){
					if(field.$el.attr(name) !== undefined)
					{
						field["rules"][name] = format_params(field.$el.attr(name));
					}
				});
				//Buscando en type="regla"
				if(field.$el.attr("type") !== undefined && rule_exists(field.$el.attr("type")))
				{
					field.rules[field.$el.attr("type")] = []
				}
				//Buscando data-rules="regla=param1,param2,param3;regla;regla;"
				if(field.$el.attr("data-rules") !== undefined)
				{
					var rules = field.$el.attr("data-rules").split(";");
					$.each(rules,function(k,rule){
						rule = rule.trim();
						if(rule.length > 0)
						{
							rule = rule.split(":");
							var name = rule[0].trim();
							if(name.length > 0)
							{
								var params = [];
								if(rule.length > 1)
								{
									params = format_params(rule[1],",");
								}
								field["rules"][name] = params;
							}
						}
					});
				}
				//Buscando data-rule-regla="param1,param2,param3"
				$.each(field.$el[0].attributes,function(i,attr){
					if(attr.name.length > 14 && attr.name.substr(0,10).toLowerCase() == "data-rule-")
					{
						field["rules"][attr.name.substr(10)] = format_params(field.$el.attr(attr.name));
					}
				});
				//Buscando en pattern="regexp"
				if(field.$el.attr("pattern") !== undefined && field.$el.attr("pattern").trim().length > 0)
				{
					field[rules]["custom-"+field.$el.attr("name")] = [];
					//Agrega a las reglas privadas "custom-[name]"
					self.options.rules["custom-"+field.$el.attr("name")] = field.$el.attr("pattern");
					if(field.$el.attr("data-msg-pattern") !== undefined)
					{
						self.options.messages["custom-"+field.$el.attr("name")] = field.$el.attr("data-msg-pattern");
					}
				}

				field.rules = order_rules(field.rules);
				self.fields[field.$el.attr("name")] = field;
			});
    }

    /**
     * Configura el formulario.
     */
    function configure_form()
    {
			//Si es un formulario
	    if(self.$el.is("form"))
	    {
	    	//Cancela las validaciones de html5
	    	self.$el.attr("novalidate",true);
	    	self.$el.on("submit",function(e){
          if(self.check_all() === false || !self.options.send_on_success)
          {
            e.preventDefault();
            return false;
          }
          else
          {
            self.$summary.remove();
            self.$el.append('<div class="sending">'+self.options.send_text+'</div>');
          }
	    	});
	    }
    }
    /**
     * Configura el sumario.
     */
    function configure_summary()
    {
      self.$summary = false;
	    if(self.$el.find(".summary").length > 0)
	    {
	    	self.$summary = self.$el.find(".summary");
		    if(!self.$summary.hasClass("alert"))
		    {
		    	self.$summary.addClass("alert");
		    }
		    if(!self.$summary.hasClass("danger"))
		    {
		    	self.$summary.addClass("danger");
		    }
        self.$summary.on("pragma.alert.open",function(e){
          $(window).scrollTop(self.$summary.offset().top);
        });
        self.$summary.addClass("hide");
        if(self.$summary.text().trim().length > 0)
        {
          self.open_summary();
        }

        
	    }
    }
    /**
     * Método privado.
     * Añade a los eventos blur y focus las validaciones del campo.
     */
    function attach_controls_events()
    {
    	self.$el.find("input,select,textarea").each(function(id){
    		$(this).on("blur",function(e){
    			self.check($(this).attr("name"));
    		}).on("focus",function(e){
    			self.clean($(this).attr("name"));
    		});
    	});
    }

    /**
     * Configura el plugin.
     */
    function configure()
    {
    	self.$el.trigger("pragma.validate.before_init");
	    configure_form();
	    configure_rules();
	    attach_controls_events();
	    configure_summary();
	    self.$el.trigger("pragma.validate.after_init");
    }
    //Configura el plugin al iniciar.
    configure();
  }

  //Versión del plugin
  Pragma.Libs.Validate.Ver = "1.0.0";

  /**Opciones del plugin**/
  Pragma.Libs.Validate.Defaults = {
    send_on_success : true,
  	validate_on : "both",//define si validará al activarse blur y al enviarse, o sólo al enviarse.
  	default_message : "Error en el campo. Por favor corríjalo.", //Mensaje de error por defecto
  	mark_success_fields : true, //Determina si se mostrará el status success cuando el campo esté correcto.
  	success_message : "¡Bien!",//Define el mensaje cuando el campo sea correcto
  	summary_text : "Se encontraron errores en el formulario, por favor, corríjalos:", //Mensaje por defecto para el sumario
  	send_text : "Enviando el formulario...",
    rules : {}, //Reglas particulares para la instancia
  	messages : {} //Mensajes de error para las reglas particulares de la instancia
  }
  /**Reglas de validación**/
  Pragma.Libs.Validate.Rules =
  {
  	required : function($el)
  	{
  		return ($el.val().trim().length > 0);
  	},
  	equalto : function($el,$parent,params)
  	{
  		var $compare = $parent.find("  [name='"+params[0]+"']");
  		if($compare.length > 0)
  		{
  			return ($compare.val() == $el.val());
  		}
  		return false;
  	},
  	min : function($el,$parent,params,rules)
  	{
  		return $el.val() >= params[0];
  	},
  	max : function($el,$parent,params)
  	{
  		return $el.val() <= params[0];
  	},
  	minlength : function($el,$parent,params)
  	{
  		return ($el.val().length >= params[0]);
  	},
  	maxlength : function($el,$parent,params)
  	{
  		return ($el.val().length <= params[0]);
  	},
  	datetime : function($el)
  	{
  		var matches = $el.val().match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/) ;
  		if(matches !== null)
  		{
				var year = parseInt(matches[1], 10);
		    var month = parseInt(matches[2], 10) - 1; // months are 0-11
		    var day = parseInt(matches[3], 10);
		    var hour = parseInt(matches[4], 10);
		    var minute = parseInt(matches[5], 10);
		    var second = parseInt(matches[6], 10);
		    var date = new Date(year, month, day, hour, minute, second);
	    	return (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day && date.getHours() === hour && date.getMinutes() === minute && date.getSeconds() === second);
	  	}
  		return false;
  	},
  	date: function($el)
  	{
  		var matches = $el.val().match(/^(\d{4})\/(\d{2})\/(\d{2})$/);

  		if(matches !== null)
  		{
  			var year = parseInt(matches[1],10);
  			var month = parseInt(matches[2],10)-1;
  			var day  = parseInt(matches[3],10);
  			var date = new Date(year,month,day);
  			return (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day);
  		}
  		return false;
  	},
  	dmydate : function($el)
  	{
  		var matches = $el.val().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  		if(matches !== null)
  		{
  			var year = parseInt(matches[3],10);
  			var month = parseInt(matches[2],10)-1;
  			var day  = parseInt(matches[1],10);
  			var date = new Date(year,month,day);
  			return (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day);
  		}
  		return false;
  	},
  	mdydate : function($el)
  	{
  		var matches = $el.val().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  		if(matches !== null)
  		{
  			var year = parseInt(matches[3],10);
  			var month = parseInt(matches[1],10)-1;
  			var day  = parseInt(matches[2],10);
  			var date = new Date(year,month,day);
  			return (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day);
  		}
  		return false;
  	},
  	card : function($el)
  	{
  		var value = $el.val();
		  // sólo números guiones y espacios
			if (/[^0-9-\s]+/.test(value)) return false;
			// Algoritmo Luhn
			var nCheck = 0, nDigit = 0, bEven = false;
			value = value.replace(/\D/g, "");
			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n),
					  nDigit = parseInt(cDigit, 10);
				if (bEven) {
					if ((nDigit *= 2) > 9) nDigit -= 9;
				}
				nCheck += nDigit;
				bEven = !bEven;
			}
			return (nCheck % 10) == 0;
  	},
    alpha: /^[a-zA-Z]+$/,
    alphanum : /^[a-zA-Z0-9]+$/,
    integer: /^[-+]?\d+$/,
    number: /^[-+]?[1-9]\d*$/,
   	//Visa,MasterCard, American Express, Diners Club, Discover, JCB
    //card : /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/,
    //empezar por letras, puede tener letras, números y guíon (-)
    cvv: /^([0-9]){3,4}$/,
    //email@host.com
   	email : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    //http://url.com
    url: /(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?/,
    // url.com
    domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,
    // HH:MM:SS
    time : /(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}/,
    // #000 o #000000
    color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
  }
  /**Mensajes de validación**/
  Pragma.Libs.Validate.Messages = 
  {
		required : "Campo requerido, no puede estar vacío.",
		alpha : "Sólo se permiten letras mayúsculas o minúsculas.",
		alphanum: "Sólo se permiten letras y números.",
		integer : "Introduzca un número entero válido.",
		number : "Introduzca un número válido.",
		card  : "Introduzca una tarjeta válida.",
		cvv   : "El código de verificación es inválido.",
		email  : "Dirección de correo inválida.",
		url   : "Dirección url inválida.",
		domain : "Nombre de dominio inválido.",
		date : "Fecha inválida, debe tener el formato YYYY-MM-DD",
		mdydate : "Fecha inválida, debe tener el formato MM-DD-YYYY",
		dmydate : "Fecha inválida, debe tener el formato DD-MM-YYYY",
		time     : "Hora inválida, debe tener el formato HH:MM:SS",
		datetime : "Fecha inválida, debe tener el formato YYYY-MM-DD HH:MM:SS",
		color    : "Color hexadecimal inválido.",
		equalto  : "El campo no coincide",
		minlength : "El campo debe tener al menos {0} caracteres de longitud.",
		maxlength : "El campo debe tener máximo {0} caracteres de longitud.",
		min : "El valor debe ser mayor o igual a {0}",
		max : "El valor debe ser menor o igual a {0}"
  }
  //Inicializa el plugin definido en html al cargar la página.
  $(function() {
    $("[data-pragma-validate]").each(function(e){
    	$(this).pragma("validate");
    });
  });

}( window.Pragma = window.Pragma || {}, jQuery ));