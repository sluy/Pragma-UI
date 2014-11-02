/**
 * Pragma.Libs.Iscroll
 * Plugin para la paginación de contenidos dinámicos cargados a través de otro sitio web una vez el scroll 
 * de la página o elemento llega al final.
 * 
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-iscroll                      : Define el plugin.
 * data-pragma-iscroll-options="[opciones]" : Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Iscroll.load()    : Carga la siguiente página del sitio remoto.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.iscroll.before_init  : Lanzado al inicializar el plugin.
 * pragma.iscroll.after_init   : Lanzado al terminar la configuración inicial del plugin.
 * pragma.iscroll.done         : Evento lanzado al finalizar la carga del contenido remoto. 
 *                               Adicionalmente provee la variable evento.jqXHR que contendrá el objeto 
 *                               XMLHTTPRequest y .evento.textStatus la cual será una cadena de caracteres 
 *                               con el status de la petición ("success", "notmodified", "error", "timeout", 
 *                               "abort", o "parsererror").
 * pragma.iscroll.success      : Evento lanzado al finalizar la carga del contenido remoto sin errores. 
 *                               Adicionalmente provee la variable evento.responseText con el contenido devuelto 
 *                               por el sitio remoto.
 * pragma.iscroll.fail         : Evento lanzado al finalizar la carga del contenido remoto con algún error, ó, 
 *                               el contenido está vacío. Adicionalmente provee la variable evento.jqXHR que
 *                               contendrá el objeto XMLHTTPRequest y .evento.textStatus la cual será una cadena 
 *                               de caracteres con el status de la petición ("success", "notmodified", "error",
 *                               "timeout", "abort", o "parsererror").
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/iscroll.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Iscroll = function (element, options)
	{
		var self = this;
		self.$el = element; 
		self.options = options; //Opciones
		/**
		 * Carga el contenido remoto de la página actual
		 */
		self.load = function()
		{
			if(self.current === false || self.loading)
			{
				return;
			}
			self.$el.trigger("pragma.iscroll.loading");
			self.loading = true;
			add_preloader();
			
			var data = self.options.data;
			data[self.options.page_var] = self.current;

			$.ajax({
			  url: self.url,
			  data: data,
			  async : self.options.async,
			  type  : self.options.method,
			  dataType : self.options.dataType,
			  complete : function( jqXHR, textStatus)
			  {
			  	self.loading = false;
			  	remove_preloader();

			  	if(textStatus == "success" && $.trim(jqXHR.responseText).length > 0)
			  	{
			  		if(self.options.mode == "auto")
			  		{
			  			get_append_element().append(jqXHR.responseText);
			  		}

			  		self.$el.trigger({
			  			type  : "pragma.iscroll.success",
			  			responseText : jqXHR.responseText,
			  			jqXHR : jqXHR
			  		});

			  		if(self.options.inverse)
			  		{
			  			self.current--;
			  		}
			  		else
			  		{
			  			self.current++;
			  		}
			  	}
			  	else
			  	{
			  		self.$el.trigger({
			  			type       : "pragma.iscroll.fail",
			  			jqXHR      : jqXHR,
			  			textStatus : textStatus
			  		});
			  		self.current = false;
			  	}
			  	self.$el.trigger({
		  			type       : "pragma.iscroll.done",
		  			jqXHR      : jqXHR,
		  			textStatus : textStatus
			  	});
			 	}
			});
		}
		/**
		 * Agrega el preloader
		 */
		function add_preloader()
		{
			self.$preloader.html(self.options.preload_text).appendTo(get_append_element());
		}
		/**
		 * Elimina el preloader
		 */
		function remove_preloader()
		{
			self.$preloader.detach();
		}
		/**
		 * Devuelve el elemento al cual se debe agregar el preloader o contenido cargado.
		 */
		function get_append_element()
		{
			if(typeof self.options.append_to == "string" && self.options.append_to.length > 0 && $(self.options.append_to).length > 0)
			{
				return $(self.options.append_to);
			}
			return self.$el;
		}
		/**
		 * Configura el plugin.
		 */
		function configure()
		{
			self.$el.trigger("pragma.iscroll.before_init");

			self.$el.addClass("infinite-scroll");
			self.current = parseInt(self.options.current_page);
			self.url = self.options.url;
			self.loading = false;
			self.$preloader = $('<div class="infinite-preloader"></div>');


			if(self.$el.attr("data-pragma-iscroll").length > 0)
			{
				self.url = self.$el.attr("data-pragma-iscroll");
			}

			if(self.$el.attr("data-current-page") !== undefined && $.trim(self.$el.attr("data-current-page").length) > 0)
			{
				self.current = parseInt($.trim(self.$el.attr("data-current-page")));
			}

			if(self.$el.attr("data-inverse-search") !== undefined)
			{
				self.options.inverse = true;
			}

			if(self.options.autoinit)
			{
				self.load();
			}

			if(self.$el.is("body")){
				$(window).scroll(function(){
					if($(window).scrollTop() + $(window).height() == $(document).height()) {
       			self.load();
   				}
				});
			}
			else
			{
				self.$el.scroll(function(){
					if($(this).scrollTop()+$(this).innerHeight() >= $(this)[0].scrollHeight)
					{
						self.load();
					}
				});
			}
			self.$el.trigger("pragma.iscroll.after_init");
		}
		//Inicia la configuración del plugin
		configure();
	}

	//Versión del plugin
	Pragma.Libs.Iscroll.Ver = "1.0.0";
	//Opciones de configuración
	Pragma.Libs.Iscroll.Defaults = {
		autoinit      : true,
		mode        : "auto",
		append_to     : "",
		page_var      : "page",
		current_page  : 1,
		inverse       : false,
		data          : {},
		async         : true,
		method        : "GET",
		dataType      : "html",
		preload_text  : 'Cargando...'
	}

	//Inicializa el plugin definido en html al cargar la página.
	$(function ()
	{
		$("[data-pragma-iscroll]").each(function ()
		{
			$(this).pragma("Iscroll");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));